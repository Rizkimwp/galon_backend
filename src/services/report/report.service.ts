import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Delivery)
    private readonly reportRepository: Repository<Delivery>,
  ) {}

  async calculateTotalPrice() {
    const deliveries = await this.reportRepository.find({
      relations: ['items'],
    });
    let totalPrice = 0;

    deliveries.forEach((delivery) => {
      // Pastikan delivery.items tidak null sebelum mengakses properti harga
      if (delivery.items && delivery.items.harga) {
        totalPrice += delivery.qty * delivery.items.harga;
      } else {
        console.error('Invalid item data:', delivery);
      }
    });

    return totalPrice;
  }

  async calculateTotalPriceByDate(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const deliveries = await this.reportRepository.find({
      where: {
        createAt: Between(startDate, endDate), // Filter berdasarkan tanggal
      },
      relations: ['items'],
    });

    let totalPrice = 0;

    deliveries.forEach((delivery) => {
      if (delivery.items && delivery.items.harga) {
        totalPrice += delivery.qty * delivery.items.harga;
      } else {
        console.error('Invalid item data:', delivery);
      }
    });

    return totalPrice;
  }

  async calculateTotalPricePerYear(year: number): Promise<number> {
    const startDate = new Date(year, 0, 1); // 1 Januari tahun yang diberikan
    const endDate = new Date(year, 11, 31); // 31 Desember tahun yang diberikan

    return await this.calculateTotalPriceByDate(startDate, endDate);
  }

  async calculateTotalPricePerMonth(
    year: number,
    month: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1); // 1 tanggal dari bulan yang diberikan
    const endDate = new Date(year, month, 0); // Akhir bulan dari bulan yang diberikan

    return await this.calculateTotalPriceByDate(startDate, endDate);
  }

  async calculateTotalPricePerDay(
    year: number,
    month: number,
    day: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, day); // Tanggal yang diberikan
    const endDate = new Date(year, month - 1, day, 23, 59, 59); // Tanggal yang diberikan hingga akhir hari

    return await this.calculateTotalPriceByDate(startDate, endDate);
  }
}
