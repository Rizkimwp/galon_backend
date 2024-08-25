import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import {
  CreateDeliveryDto,
  SimpleDeliveryDTO,
  SimpleProductOrderDTO,
} from 'src/dto/deliveryDto';
import { DeliveryStatus } from 'src/enum/status';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { Between, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as qrcode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import { Customer } from 'src/TypeOrm/entities/customer.entity';

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
  ) {}

  async createDelivery(
    createDeliveryDto: CreateDeliveryDto,
  ): Promise<Delivery> {
    try {
      const { orderId, courierId } = createDeliveryDto;

      // Validate order
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['orderProducts', 'orderProducts.product', 'customer'], // Ensure related entities are loaded
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Validate courier
      const courier = await this.courierRepository.findOne({
        where: { id: courierId },
      });
      if (!courier) {
        throw new NotFoundException(`Courier with ID ${courierId} not found`);
      }

      // Generate QR code image
      const qrCodePath = await this.generateQRCodeImage(order);

      // Create new delivery
      const delivery = new Delivery();
      delivery.id = uuidv4(); // Generate a new UUID for the delivery ID
      delivery.order = order;
      delivery.courier = courier;
      delivery.status = DeliveryStatus.PROSES;
      delivery.barcode = qrCodePath; // Store QR code path

      // Save the delivery to the database
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      // Log the error (optional)
      console.error('Error creating delivery:', error.message);

      // Re-throw the error to be handled by NestJS's global exception filter
      throw new InternalServerErrorException('Failed to create delivery');
    }
  }
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
      .map(([name, quantity]) => `${name} ${quantity}`)
      .join(', ');

    // QR code data (order ID)
    const qrCodeData = order.id;
    const fileName = `${uuidv4()}.png`; // Generate a unique file name
    const uploadPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'uploads',
      fileName,
    );

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

      ctx.fillText(`Customer: ${order.customer.name}`, 200, textYPosition);
      ctx.fillText(
        `Address: ${order.customer.address}`,
        200,
        textYPosition + 30,
      );
      ctx.fillText(`Products: ${productDetails}`, 200, textYPosition + 60);

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

    return Promise.all(response.map(this.mapToSimpleDeliveryDTO));
  }

  async getDeliveryByCustomerIdToday(customerId: string): Promise<Delivery[]> {
    // Find the customer based on the user ID
    const customer = await this.customerRepository.findOne({
      where: {
        user: {
          id: customerId,
        },
      },
    });

    // If the customer is not found, throw a NotFoundException
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Get the start and end of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set to 00:00:00

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set to 23:59:59.999

    // Find the deliveries based on the found customer's ID and today's date
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

    return simpleDeliveryDTO;
  }
}
