import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import {
  CreateDeliveryDto,
  DeliveryAdminDto,
  SimpleDeliveryDTO,
  SimpleProductOrderDTO,
  UpdateDeliveryStatusDto,
} from 'src/dto/deliveryDto';
import { DeliveryStatus } from 'src/enum/status';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { Between, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as qrcode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { FileService } from '../file/file.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Courier)
    private courierRepository: Repository<Courier>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private readonly fileService: FileService,
  ) {}

  async createDelivery(
    createDeliveryDto: CreateDeliveryDto,
  ): Promise<Delivery> {
    try {
      const { orderId, courierId, createdAt } = createDeliveryDto;

      // Validate order
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product', 'customer'], // Ensure related entities are loaded
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Validate courier

      // Generate QR code image
      const qrCodePath = await this.generateQRCodeImage(order);

      // Create new delivery
      const delivery = new Delivery();
      delivery.id = uuidv4(); // Generate a new UUID for the delivery ID
      delivery.order = order;
      delivery.courierId = courierId;
      delivery.status = DeliveryStatus.PROSES;
      delivery.barcode = qrCodePath; // Store QR code path
      delivery.createdAt = createdAt || new Date();
      // Save the delivery to the database
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      // Log the error (optional)
      console.error('Error creating delivery:', error.message);

      // Re-throw the error to be handled by NestJS's global exception filter
      throw new InternalServerErrorException('Failed to create delivery');
    }
  }

  // ---------------------------------------------------------
  private async generateQRCodeImage(order: Order): Promise<string> {
    // Aggregate product names and quantities
    const productSummary = order.orderProducts.reduce(
      (summary, orderProduct) => {
        const productName = orderProduct.product.name;
        const quantity = orderProduct.quantity;

        if (summary[productName]) {
          summary[productName] += quantity; // Update quantity if product already exists
        } else {
          summary[productName] = quantity; // Add new product to summary
        }

        return summary;
      },
      {} as Record<string, number>,
    );

    // Format product names and quantities for display
    const productDetails = Object.entries(productSummary)
      .map(([name, quantity]) => `${name} x(${quantity})`)
      .join(', ');

    // QR code data (order ID)
    const qrCodeData = order.id;
    const fileName = `${uuidv4()}.png`; // Generate a unique file name
    const uploadPath = path.join(process.cwd(), 'uploads', fileName);
    try {
      // Generate QR code as a buffer
      const qrCodeBuffer = await qrcode.toBuffer(qrCodeData, {
        errorCorrectionLevel: 'H',
      });

      // Create a canvas to draw QR code and text
      const canvas = createCanvas(400, 600); // Adjust the size as needed
      const ctx = canvas.getContext('2d');

      // Draw QR code
      const qrImage = await loadImage(qrCodeBuffer);
      ctx.drawImage(qrImage, 50, 50, 300, 300); // Adjust the position and size

      // Draw text below QR code
      ctx.font = '20px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      const textYPosition = 400; // Y position for the text

      ctx.fillText(`Pelanggan: ${order.customer.name}`, 200, textYPosition);
      ctx.fillText(
        `Alamat: ${order.customer.address}`,
        200,
        textYPosition + 30,
      );
      ctx.fillText(`Barang: ${productDetails}`, 200, textYPosition + 60);

      // Ensure the upload directory exists
      const uploadDir = path.dirname(uploadPath);
      fs.mkdirSync(uploadDir, { recursive: true });

      // Save the canvas to a file
      const out = fs.createWriteStream(uploadPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      return new Promise<string>((resolve, reject) => {
        out.on('finish', () => resolve(fileName));
        out.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating QR code image:', error.message);
      throw new InternalServerErrorException(
        'Failed to generate QR code image',
      );
    }
  }

  // ---------------------------------------------------------
  async getDeliveryAll(): Promise<DeliveryAdminDto[]> {
    const deliveries = await this.deliveryRepository.find({
      relations: [
        'courier',
        'order',
        'order.customer',
        'order.orderProducts',
        'order.orderProducts.product',
      ],
    });

    // Map setiap delivery ke dalam bentuk DTO yang diinginkan
    return deliveries.map((delivery) => {
      // Hitung total produk yang dibeli
      const totalProducts = delivery.order.orderProducts.reduce(
        (total, orderProduct) => total + orderProduct.quantity,
        0,
      );

      // Ambil detail barang yang dibeli
      const products = delivery.order.orderProducts.map((orderProduct) => ({
        id: orderProduct.product.id,
        name: orderProduct.product.name,
        quantity: orderProduct.quantity,
        price: orderProduct.product.price,
      }));

      // Jika courier null, set menjadi "Belum Ada Kurir"
      const courierName = delivery.courier
        ? delivery.courier.name
        : 'Belum Ada Kurir';
      const courierId = delivery.courier ? delivery.courier.id : '';

      return {
        id: delivery.id,
        status: delivery.status,
        courierId: courierId,
        courierName: courierName,
        customerName: delivery.order.customer.name,
        customerAddress: delivery.order.customer.address,
        customerPhoneNumber: delivery.order.customer.phoneNumber,
        totalProducts: totalProducts,
        products: products,
        createdAt: delivery.createdAt,
      };
    });
  }

  // ---------------------------------------------------------
  async getDeliveryByCustomerId(
    customerId: string,
  ): Promise<SimpleDeliveryDTO[]> {
    const customer = await this.customerRepository.findOne({
      where: {
        user: {
          id: customerId,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const response = await this.deliveryRepository.find({
      where: {
        order: {
          customerId: customer.id,
        },
      },
      relations: [
        'order',
        'order.customer',
        'order.orderProducts',
        'order.orderProducts.product',
      ],
    });
    console.log(customerId);
    return Promise.all(response.map(this.mapToSimpleDeliveryDTO));
  }

  // ---------------------------------------------------------
  async getDeliveryByCustomerIdToday(userId: string): Promise<Delivery[]> {
    // Find the customer based on the user ID
    const customer = await this.customerRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    // If the customer is not found, throw a NotFoundException
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get the start and end of today
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // Find deliveries created today
    const deliveries = await this.deliveryRepository.find({
      where: {
        order: {
          customerId: customer.id,
        },
        createdAt: Between(todayStart, todayEnd), // Filter by today's date
      },
      relations: [
        'order',
        'order.customer',
        'order.orderProducts',
        'order.orderProducts.product',
      ],
    });

    return deliveries;
  }

  // ---------------------------------------------------------
  async getDeliveryReport(startDate: Date, endDate: Date): Promise<any> {
    const deliveries = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.orderProducts', 'orderProduct')
      .leftJoinAndSelect('orderProduct.product', 'product')
      .where('delivery.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    const deliveryReport = deliveries.reduce((acc, delivery) => {
      delivery.order.orderProducts.forEach((orderProduct) => {
        const product = orderProduct.product;
        const totalProfit =
          orderProduct.quantity * (product.price - product.originalPrice);

        if (!acc[delivery.id]) {
          acc[delivery.id] = {
            deliveryId: delivery.id,
            totalProfit: 0,
          };
        }

        acc[delivery.id].totalProfit += totalProfit;
      });
      return acc;
    }, {} as any);

    return Object.values(deliveryReport);
  }

  // ---------------------------------------------------------
  async getTotalProfit(start: Date, end: Date): Promise<number> {
    // Mengambil semua pengiriman dengan status lunas dalam rentang waktu yang diberikan
    const deliveries = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.orderProducts', 'orderProduct')
      .leftJoinAndSelect('orderProduct.product', 'product')
      .where('delivery.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.status = :status', { status: 'Lunas' }) // Hanya ambil order yang lunas
      .getMany();

    let totalProfit = 0;

    // Perhitungan keuntungan per produk
    for (const delivery of deliveries) {
      for (const orderProduct of delivery.order.orderProducts) {
        const product = orderProduct.product;

        // Keuntungan dihitung sebagai (harga jual - harga modal) * kuantitas
        const profitPerProduct =
          (product.price - product.originalPrice) * orderProduct.quantity;
        totalProfit += profitPerProduct;
      }
    }

    return totalProfit;
  }

  // --------------------------------------------------------
  async getTotal(start: Date, end: Date): Promise<number> {
    // Mengambil semua pengiriman dengan status lunas dalam rentang waktu yang diberikan
    const deliveries = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.orderProducts', 'orderProduct')
      .leftJoinAndSelect('orderProduct.product', 'product')
      .where('delivery.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.status = :status', { status: 'Lunas' }) // Hanya ambil order yang lunas
      .getMany();

    let totalProfit = 0;

    // Perhitungan keuntungan per produk
    for (const delivery of deliveries) {
      for (const orderProduct of delivery.order.orderProducts) {
        const product = orderProduct.product;

        // Keuntungan dihitung sebagai (harga jual - harga modal) * kuantitas
        const profitPerProduct = product.price * orderProduct.quantity;
        totalProfit += profitPerProduct;
      }
    }

    return totalProfit;
  }
  // ---------------------------------------------------------
  async updateDeliveryStatus(orderId: string, status: DeliveryStatus) {
    const delivery = await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery for order ID ${orderId} not found`);
    }

    delivery.status = status;
    await this.deliveryRepository.save(delivery);
  }

  // --------------------------------------------
  async findDeliveryByOrderId(orderId: string) {
    return await this.deliveryRepository.findOne({
      where: { order: { id: orderId } },
      relations: ['courier'],
    });
  }
  // ------------------------------
  async updateDelivery(
    updateDeliveryStatusDto: UpdateDeliveryStatusDto,
  ): Promise<string> {
    const { deliveryIds, status, courierId } = updateDeliveryStatusDto;

    const courier = await this.courierRepository.findOne({
      where: { id: courierId },
    });
    if (!courier) {
      throw new NotFoundException(`Courier with ID ${courierId} not found`);
    }

    const deliveries = await this.deliveryRepository.find({
      where: { id: In(deliveryIds) },
      relations: [
        'order',
        'order.customer',
        'order.orderProducts',
        'order.orderProducts.product',
      ],
    });

    if (deliveries.length === 0) {
      throw new NotFoundException('No deliveries found for the provided IDs');
    }

    const updatedDeliveries = deliveries.map((delivery) => {
      delivery.status = status;
      delivery.courier = courier;
      return delivery;
    });

    await this.deliveryRepository.save(updatedDeliveries);

    return `Delivery status updated for deliveries: ${deliveryIds}`;
  }

  // ---------------------------------------------------------
  async mapToSimpleDeliveryDTO(delivery: Delivery): Promise<SimpleDeliveryDTO> {
    const simpleDeliveryDTO = new SimpleDeliveryDTO();
    simpleDeliveryDTO.orderId = delivery.order.id;
    simpleDeliveryDTO.orderDate = delivery.order.createdAt;
    simpleDeliveryDTO.status = delivery.status;

    // Menghitung total harga dari semua produk dalam pesanan
    simpleDeliveryDTO.totalPrice = delivery.order.orderProducts.reduce(
      (total, orderProduct) =>
        total + orderProduct.product.price * orderProduct.quantity,
      0,
    );

    // Map produk ke SimpleProductOrderDTO
    simpleDeliveryDTO.products = delivery.order.orderProducts.map(
      (orderProduct) => {
        const simpleProductOrderDTO = new SimpleProductOrderDTO();
        simpleProductOrderDTO.productName = orderProduct.product.name;
        simpleProductOrderDTO.quantity = orderProduct.quantity;
        simpleProductOrderDTO.photo = orderProduct.product.photo;
        return simpleProductOrderDTO;
      },
    );
    console.log(simpleDeliveryDTO);
    return simpleDeliveryDTO;
  }

  async generateCombinedDeliveryInvoice(
    deliveries: Delivery[],
  ): Promise<string> {
    if (deliveries.length === 0) {
      throw new NotFoundException('No deliveries to generate invoice for');
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const fileName = `combined_delivery_invoice_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

    // Create the 'invoices' directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Pipe the PDF into a file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add content to PDF
    doc.fontSize(20).text('Combined Delivery Invoice', { align: 'center' });
    doc.moveDown();

    let grandTotal = 0;

    // Add delivery details
    for (const delivery of deliveries) {
      doc.fontSize(16).text(`Delivery ID: ${delivery.id}`);
      doc.text(`Courier: ${delivery.courier.name}`);
      doc.text(`Customer: ${delivery.order.customer.name}`);
      doc.text(`Address: ${delivery.order.customer.address}`);
      doc.moveDown();

      // List products
      doc.fontSize(14).text('Products:');
      delivery.order.orderProducts.forEach((orderProduct) => {
        const { product, quantity } = orderProduct;
        doc.fontSize(12).text(`${product.name} - Quantity: ${quantity}`);
      });

      // Add total
      const totalAmount = delivery.order.orderProducts.reduce(
        (total, orderProduct) =>
          total + orderProduct.product.price * orderProduct.quantity,
        0,
      );
      doc.moveDown();
      doc
        .fontSize(14)
        .text(
          `Total Amount for Delivery ID ${delivery.id}: ${totalAmount} USD`,
        );
      doc.moveDown();

      grandTotal += totalAmount; // Accumulate grand total
    }

    // Add grand total
    doc.fontSize(16).text(`Grand Total: ${grandTotal} USD`, { align: 'right' });

    // Finalize PDF file
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}
