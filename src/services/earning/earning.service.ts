import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { CourierEarnings } from 'src/TypeOrm/entities/courier_earnings.entity';
import { Between, Repository } from 'typeorm';

import {
  CourierSalarySlipDTO,
  DeliveryDetailDTO,
  GetCourierSalarySlipDTO,
} from 'src/dto/earningDto';
import puppeteer from 'puppeteer';

@Injectable()
export class EarningService {
  constructor(
    @InjectRepository(CourierEarnings)
    private readonly courierEarningsRepository: Repository<CourierEarnings>,
    @InjectRepository(Courier)
    private readonly courierRepository: Repository<Courier>,
  ) {}
  // Metode untuk mendapatkan slip gaji kurir berdasarkan courierId
  async getCourierSalarySlip({
    date,
    courierId,
  }: GetCourierSalarySlipDTO): Promise<CourierSalarySlipDTO> {
    // Check if courier exists
    const courier = await this.courierRepository.findOne({
      where: { id: courierId },
    });
    if (!courier) {
      throw new NotFoundException(`Courier with ID ${courierId} not found`);
    }

    // Determine the date range
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Query for courier earnings within the date range
    const earnings = await this.courierEarningsRepository.find({
      where: {
        courier: { id: courierId },
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: [
        'delivery',
        'delivery.order',
        'delivery.order.orderProducts',
        'delivery.order.orderProducts.product',
        'delivery.order.customer',
      ],
    });

    if (!earnings || earnings.length === 0) {
      throw new NotFoundException(
        `No earnings found for courier ID ${courierId} on ${date.toISOString().split('T')[0]}`,
      );
    }

    // Process earnings
    const deliveryMap: Record<string, DeliveryDetailDTO> = {};

    for (const earning of earnings) {
      const deliveryId = earning.delivery.id;

      if (!deliveryMap[deliveryId]) {
        deliveryMap[deliveryId] = {
          productName: '',
          quantity: 0,
          customerName: earning.delivery.order.customer.name,
          customerAddress: earning.delivery.order.customer.address,
        };

        deliveryMap[deliveryId].productName =
          earning.delivery.order.orderProducts
            .map((orderProduct) => orderProduct.product.name)
            .join(', ');

        deliveryMap[deliveryId].quantity =
          earning.delivery.order.orderProducts.reduce(
            (total, orderProduct) => total + orderProduct.quantity,
            0,
          );
      }
    }

    const details: DeliveryDetailDTO[] = Object.values(deliveryMap);

    // Calculate total earnings
    const totalEarnings = earnings.reduce(
      (total, earning) => total + earning.amount,
      0,
    );

    // Create salary slip
    const salarySlip: CourierSalarySlipDTO = {
      courierName: courier.name,
      tanggal: date.toISOString(), // Date of the report
      totalEarnings,
      details,
    };

    return salarySlip;
  }

  async generateSalarySlipHtml(data: CourierSalarySlipDTO): Promise<string> {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                margin-bottom: 20px;
            }
            .content h2 {
                font-size: 18px;
                margin-bottom: 10px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .table th, .table td {
                border: 1px solid #ddd;
                padding: 8px;
            }
            .table th {
                background-color: #f4f4f4;
                text-align: left;
            }
            .footer {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SLIP GAJI PENGIRIMAN</h1>
            <p>Depo Isi Ulang Rizky Cendani 2</p>
            <p>Griya Asri Mahoni</p>
            <p>Telp: 0812-9548-9405</p>
        </div>
        <div class="content">
            <h2>Nama: ${data.courierName}</h2>
            <h2>Total Pendapatan: Rp ${data.totalEarnings}</p>
            <h2>Tanggal: ${new Date(data.tanggal).toLocaleDateString()}</h2>
            <table class="table">
              <thead>
                <tr>
                <th>Nama Pelanggan</th>
                <th>Alamat Pelanggan</th>
                  <th>Produk</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${data.details
                  .map(
                    (detail) => `
                    <tr>
                    <td>${detail.customerName}</td>
                    <td>${detail.customerAddress}</td>
                      <td>${detail.productName}</td>
                      <td>x ${detail.quantity}</td>
                    </tr>`,
                  )
                  .join('')}
              </tbody>
            </table>
        </div>
        <div class="footer">
            <p>Terima kasih atas kerja keras Anda!</p>
        </div>
    </body>
    </html>
    `;
  }

  // Fungsi untuk membuat PDF menggunakan puppeteer
  async generateSalarySlipPdf(data: CourierSalarySlipDTO): Promise<Buffer> {
    const html = await this.generateSalarySlipHtml(data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    // Generate PDF dan dapatkan dalam bentuk Uint8Array
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    // Convert Uint8Array ke Buffer
    return Buffer.from(pdfBuffer);
  }
}
