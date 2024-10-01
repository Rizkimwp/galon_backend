import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateOrderDto,
  MonthlyReportDto,
  UpdateOrderCustomerProduct,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from 'src/dto/orderDto';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { OrderProduct } from 'src/TypeOrm/entities/orderproduct.entity';
import { Product } from 'src/TypeOrm/entities/product.entity';
import { Between, DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DeliveryService } from '../delivery/delivery.service';
import { OrderDto } from '../../dto/orderDto';

import { startOfDay, endOfDay } from 'date-fns';
import { DeliveryStatus, OrderStatus } from 'src/enum/status';
import { Invoice } from 'src/TypeOrm/entities/invoice.entity';
import { CourierEarnings } from 'src/TypeOrm/entities/courier_earnings.entity';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { KeuanganService } from '../keuangan/keuangan.service';
@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(CourierEarnings)
    private earningRepository: Repository<CourierEarnings>,

    private readonly keuanganService: KeuanganService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    try {
      const { products, status, userId, isDelivery, courierId, createdAt } =
        createOrderDto;

      // Validasi customer
      const customer = await this.customerRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with user ID ${userId} not found`,
        );
      }

      // Buat order baru
      const order = new Order();
      order.id = uuidv4();
      order.customerId = customer.id;
      order.status = isDelivery === true ? OrderStatus.PENDING : status;

      // Jika createdAt diberikan, gunakan, jika tidak, gunakan waktu saat ini
      order.createdAt = createdAt || new Date();

      // Check stock for each product before saving the order
      for (const productDto of products) {
        const productEntity = await this.productRepository.findOne({
          where: { id: productDto.id },
        });

        if (!productEntity) {
          throw new NotFoundException(
            `Product with ID ${productDto.id} not found`,
          );
        }

        // Check if product stock is sufficient
        if (productEntity.stock < productDto.quantity) {
          throw new BadRequestException(
            `Barang ${productEntity.name} Stok Habis. Stok Tersisa ${productEntity.stock}`,
          );
        }
      }

      // Simpan order terlebih dahulu
      await this.orderRepository.save(order);

      // Handle produk pesanan dan update stok
      for (const productDto of products) {
        const productEntity = await this.productRepository.findOne({
          where: { id: productDto.id },
        });

        const orderProduct = new OrderProduct();
        orderProduct.id = uuidv4();
        orderProduct.order = order;
        orderProduct.product = productEntity;
        orderProduct.quantity = productDto.quantity;

        // Simpan OrderProduct
        await this.orderProductRepository.save(orderProduct);

        // Update stok produk
        productEntity.stock -= productDto.quantity;
        await this.productRepository.save(productEntity);
      }

      // Load the saved order with relations
      const savedOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['orderProducts', 'orderProducts.product', 'customer'],
      });

      if (!savedOrder) {
        throw new NotFoundException(`Order with ID ${order.id} not found`);
      }

      // Update customer debt if status is "Hutang"
      if (status === 'Hutang') {
        const debtAmount = this.calculateOrderTotal(savedOrder);

        // Buat invoice baru
        const invoice = this.invoiceRepository.create({
          customer: savedOrder.customer,
          order: savedOrder,
          invoiceNumber: `INV-${Date.now()}`,
          totalAmount: debtAmount,
          dueDate: new Date(),
          status: OrderStatus.HUTANG,
        });

        await this.invoiceRepository.save(invoice);

        customer.debt = (customer.debt || 0) + debtAmount;
        await this.customerRepository.save(customer);
      }

      // Tambahkan poin jika status adalah "Lunas"
      if (status === 'Lunas') {
        const pointsToAdd = order.orderProducts.reduce(
          (totalPoints, orderProduct) => {
            // Tambahkan poin hanya jika harga produk lebih dari 5000
            if (orderProduct.product.price <= 5000) {
              return totalPoints + orderProduct.quantity * 350;
            }
            return totalPoints; // Jika tidak, kembalikan totalPoints tanpa perubahan
          },
          0,
        );

        customer.points += pointsToAdd;
        await this.customerRepository.save(customer);

        // Buat pemasukan untuk transaksi keuangan
        const totalAmount = (savedOrder.orderProducts || []).reduce(
          (total, orderProduct) => {
            return total + orderProduct.quantity * orderProduct.product.price;
          },
          0,
        );

        await this.keuanganService.catatPendapatanOrder({
          orderId: savedOrder.id,
          customerId: customer.id,
          totalAmount,
        });
      }

      // Trigger delivery if isDelivery is true
      if (isDelivery) {
        try {
          await this.deliveryService.createDelivery({
            orderId: savedOrder.id,
            courierId,
            createdAt,
          });
        } catch (error) {
          // Jika pembuatan pengiriman gagal, batalkan seluruh order
          await this.orderRepository.remove(savedOrder); // Hapus order dari database
          throw new Error('Failed to create delivery');
        }
      }

      return savedOrder;
    } catch (error) {
      // Log error
      console.error('Error creating order:', error.message);

      // Rethrow error untuk ditangani oleh global exception handler
      throw error;
    }
  }

  async updateCustomerAndProduct(
    updateDeliveryDto: UpdateOrderCustomerProduct,
  ) {
    try {
      const { orderId, customerId, productUpdates } = updateDeliveryDto;

      // Cari order berdasarkan orderId
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['customer', 'orderProducts', 'orderProducts.product'],
      });

      if (!order) {
        throw new NotFoundException(
          `Order dengan ID ${orderId} tidak ditemukan`,
        );
      }

      if (
        order.status === OrderStatus.LUNAS ||
        order.status === OrderStatus.HUTANG
      ) {
        throw new BadRequestException(
          `Order dengan status ${order.status} tidak dapat diubah`,
        );
      }

      // Update customer jika customerId disediakan
      if (customerId) {
        const customer = await this.customerRepository.findOne({
          where: { id: customerId },
        });

        if (!customer) {
          throw new NotFoundException(
            `Customer dengan ID ${customerId} tidak ditemukan`,
          );
        }

        order.customer = customer; // Update customer pada order
      }

      // Update produk dalam pesanan (orderProducts)
      if (productUpdates && productUpdates.length > 0) {
        for (const update of productUpdates) {
          const orderProduct = order.orderProducts.find(
            (op) => op.product.id === update.productId,
          );

          if (orderProduct) {
            // Update quantity atau properti lainnya dari produk
            orderProduct.quantity = update.quantity || orderProduct.quantity;
          }
        }
      }

      // Simpan perubahan order
      await this.orderRepository.save(order);

      return order; // Kembalikan order yang telah diperbarui
    } catch (error) {
      console.error('Error updating delivery:', error.message);
      throw error;
    }
  }

  // ----------------------------------------------
  async requestDelivery(updateDeliveryDto: UpdateOrderDto) {
    try {
      const { orderId, courierId, createdAt } = updateDeliveryDto;

      // Cari order berdasarkan orderId
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['customer', 'orderProducts'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Update tanggal order jika diperlukan
      if (createdAt) {
        order.createdAt = new Date(createdAt); // Pastikan format tanggal valid
        await this.orderRepository.save(order);
      }

      // Cari atau buat pengiriman baru
      const existingDelivery = await this.deliveryRepository.findOne({
        where: { order: { id: orderId } },
      });

      if (existingDelivery) {
        // Update pengiriman yang ada
        existingDelivery.courierId = courierId;
        existingDelivery.createdAt = createdAt
          ? new Date(createdAt)
          : existingDelivery.createdAt;

        await this.deliveryRepository.save(existingDelivery);
        return existingDelivery;
      } else {
        // Buat pengiriman baru
        const delivery = await this.deliveryService.createDelivery({
          orderId: order.id,
          courierId,
          createdAt: createdAt ? new Date(createdAt) : new Date(), // Default ke tanggal saat ini
        });
        return delivery;
      }
    } catch (error) {
      console.error('Error updating delivery:', error.message);
      throw error;
    }
  }

  // ---------------------------------------------
  async getOrdersByCustomer(customerId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: [
        'orders',
        'orders.orderProducts',
        'orders.orderProducts.product',
      ],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return customer.orders;
  }

  // -------------------------------------------
  async getAllOrders(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      relations: [
        'deliveries',
        'orderProducts',
        'customer',
        'orderProducts.product',
      ],
    });

    // Mapping orders to OrderResponseDto
    return orders.map((order) => this.mapToOrderResponseDto(order));
  }

  // ------------------------------------------------
  async getAllOrdersToday(): Promise<OrderDto[]> {
    const today = new Date();

    // Mengambil awal dan akhir hari ini
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfToday, endOfToday), // Filter pesanan untuk hari ini
      },
      relations: [
        'deliveries',
        'orderProducts',
        'customer',
        'orderProducts.product',
      ],
    });

    // Mapping orders to OrderDto
    return orders.map((order) => this.mapToOrderResponseDto(order));
  }

  // -------------------------------------------------
  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto) {
    try {
      const { orderIds, status } = updateOrderStatusDto;

      // Loop untuk setiap orderId
      for (const orderId of orderIds) {
        // Cari pesanan berdasarkan ID
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
          relations: ['customer', 'orderProducts', 'orderProducts.product'], // Mengambil data customer dan produk
        });

        if (!order) {
          throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Validasi customer
        const customer = await this.customerRepository.findOne({
          where: { id: order.customer.id },
        });

        if (!customer) {
          throw new NotFoundException(
            `Customer with user ID ${order.customer.id} not found`,
          );
        }

        // Update status pesanan
        order.status = status;
        await this.orderRepository.save(order);

        const delivery =
          await this.deliveryService.findDeliveryByOrderId(orderId);

        // Update status pengiriman ke 'delivered' jika pengiriman ditemukan
        if (delivery) {
          await this.deliveryService.updateDeliveryStatus(
            orderId,
            DeliveryStatus.DELIVERED,
          );
          let totalPoints = 0;

          for (const orderProduct of order.orderProducts) {
            const pointsPerProduct =
              orderProduct.product.price > 5000 ? 500 : 1000;
            totalPoints += pointsPerProduct * orderProduct.quantity;
          }

          const courierEarning = this.earningRepository.create({
            courier: delivery.courier,
            delivery: delivery,
            amount: totalPoints,
          });

          await this.earningRepository.save(courierEarning);
        }

        // Jika pesanan belum lunas (hutang), tambahkan jumlah utang ke customer dan buat invoice
        if (status === 'Hutang') {
          const debtAmount = this.calculateOrderTotal(order);

          const invoice = this.invoiceRepository.create({
            customer: order.customer,
            order,
            invoiceNumber: `INV-${Date.now()}`,
            totalAmount: debtAmount,
            dueDate: new Date(),
            status: OrderStatus.HUTANG,
          });

          await this.invoiceRepository.save(invoice);

          customer.debt = (customer.debt || 0) + debtAmount;
          await this.customerRepository.save(customer);
        }

        // Jika pesanan lunas, tambahkan poin ke customer
        if (status === 'Lunas') {
          const pointsToAdd = order.orderProducts.reduce(
            (totalPoints, orderProduct) => {
              // Tambahkan poin hanya jika harga produk lebih dari 5000
              if (orderProduct.product.price <= 5000) {
                return totalPoints + orderProduct.quantity * 350;
              }
              return totalPoints; // Jika tidak, kembalikan totalPoints tanpa perubahan
            },
            0,
          );

          order.customer.points += pointsToAdd;
          await this.customerRepository.save(order.customer);

          const totalAmount = (order.orderProducts || []).reduce(
            (total, orderProduct) => {
              return total + orderProduct.quantity * orderProduct.product.price;
            },
            0,
          );

          await this.keuanganService.catatPendapatanOrder({
            orderId: order.id,
            customerId: customer.id,
            totalAmount,
          });
        }
      }

      return { message: 'Order statuses updated successfully' };
    } catch (error) {
      console.error('Error updating order status:', error.message);
      throw error;
    }
  }

  async getOrdersPerMonth(): Promise<MonthlyReportDto[]> {
    const query = `
       SELECT 
      YEAR(createdAt) AS year, 
      MONTH(createdAt) AS month, 
      COUNT(*) AS count 
    FROM \`orders\`
    GROUP BY year, month
    ORDER BY year, month
    `;

    const result = await this.orderRepository.query(query);

    // Map result to DTO
    return result.map((row) => ({
      year: Number(row.year),
      month: Number(row.month),
      count: Number(row.count),
    }));
  }

  calculateOrderTotal(order: Order): number {
    let total = 0;

    // Pastikan orderProducts adalah array dan memiliki elemen valid
    if (!Array.isArray(order.orderProducts)) {
      throw new Error('orderProducts should be an array');
    }

    for (const product of order.orderProducts) {
      // Validasi bahwa item dalam orderProducts tidak undefined atau null
      if (product && product.product && product.quantity) {
        // Kalikan harga produk dengan jumlah dan tambahkan ke total
        total += product.product.price * product.quantity;
      } else {
        throw new Error('Invalid product structure in orderProducts');
      }
    }

    return total;
  }

  // --------------------------------------------
  async deleteOrder(orderId: string): Promise<void> {
    try {
      // Cari order berdasarkan orderId
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'deliveries', 'invoice'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Hapus orderProducts terkait
      if (order.orderProducts && order.orderProducts.length > 0) {
        await this.orderProductRepository.remove(order.orderProducts);
      }

      // Hapus delivery terkait jika ada
      if (order.deliveries) {
        await this.deliveryRepository.remove(order.deliveries);
      }

      // Hapus invoice terkait jika ada
      if (order.invoice) {
        await this.invoiceRepository.remove(order.invoice);
      }

      // Hapus order
      await this.orderRepository.remove(order);
    } catch (error) {
      console.error('Error deleting order:', error.message);
      throw error;
    }
  }

  // Function to map the Order entity to OrderResponseDto
  private mapToOrderResponseDto(order: Order): OrderDto {
    const products = order.orderProducts.map((orderProduct) => ({
      id: orderProduct.product.id,
      name: orderProduct.product.name,
      price: orderProduct.product.price,
      quantity: orderProduct.quantity,
    }));

    const totalPrice = products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0,
    );

    return {
      id: order.id,
      customer: {
        address: order.customer.address,
        id: order.customer.id,
        name: order.customer.name,
      },
      products: products,
      totalprice: totalPrice,
      status: order.status,
      isDelivery: order.requiresDelivery,
      createdAt: order.createdAt,
    };
  }
}
