import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from 'src/dto/orderDto';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { OrderProduct } from 'src/TypeOrm/entities/orderproduct.entity';
import { Product } from 'src/TypeOrm/entities/product.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    try {
      const { products, status, userId } = createOrderDto;

      // Validate customer
      const customer = await this.customerRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with user ID ${userId} not found`,
        );
      }

      // Create new order
      const order = new Order();
      order.id = uuidv4();
      order.customerId = customer.id;
      order.status = status;

      await this.orderRepository.save(order);

      // Handle order products and update stock
      for (const productDto of products) {
        const productEntity = await this.productRepository.findOne({
          where: { id: productDto.id },
        });

        if (!productEntity) {
          throw new NotFoundException(
            `Product with ID ${productDto.id} not found`,
          );
        }

        const orderProduct = new OrderProduct();
        orderProduct.id = uuidv4();
        orderProduct.order = order;
        orderProduct.product = productEntity;
        orderProduct.quantity = productDto.quantity;

        // Save OrderProduct
        await this.orderProductRepository.save(orderProduct);

        // Update product stock
        productEntity.stock -= productDto.quantity;
        productEntity.rating += productDto.quantity;
        await this.productRepository.save(productEntity);

        // Update product rating based on quantity
      }

      return order;
    } catch (error) {
      // Log the error (optional)
      console.error('Error creating order:', error.message);

      // Re-throw the error to be handled by NestJS's global exception filter
      throw error;
    }
  }

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
}
