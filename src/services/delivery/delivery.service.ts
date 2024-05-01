import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { Customers } from 'src/TypeOrm/entities/customers.entity';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { Items } from 'src/TypeOrm/entities/items.entity';

import { DeliveryDto } from 'src/dto/DeliveryDto';

import { Repository } from 'typeorm';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(Items)
    private itemsRepository: Repository<Items>,
    @InjectRepository(Courier)
    private courierRepository: Repository<Courier>,
  ) {}

  async findAll() {
    return await this.deliveryRepository.find({
      relations: ['items', 'courier'],
    });
  }

  async findByKurirAndToday(kurirId: number): Promise<Delivery[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set waktu ke awal hari ini
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Tambahkan 1 hari untuk mendapatkan awal hari besok

    let res = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.courier', 'courier')
      .leftJoinAndSelect('delivery.items', 'items')
      .leftJoinAndSelect('delivery.customers', 'customers')
      .andWhere('delivery.createAt >= :today', { today })
      .andWhere('delivery.createAt < :tomorrow', { tomorrow });

    if (kurirId) {
      res = res.andWhere('courier.id = :kurirId', { kurirId });
    }

    return res.getMany();
  }

  async findByKurirAndDate(kurirId: number, tanggal: string) {
    const parsedDate = new Date(tanggal);
    return await this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.kurirId = :kurirId', { kurirId })
      .andWhere('DATE(delivery.createAt) = :tanggal', {
        tanggal: parsedDate.toISOString().split('T')[0],
      }) // Format tanggal as "YYYY-MM-DD"
      .getMany();
  }

  async create(data: DeliveryDto[] | DeliveryDto) {
    let dataArray: DeliveryDto[] = [];

    if (Array.isArray(data)) {
      dataArray = data;
    } else {
      dataArray = [data];
    }

    const deliveries = dataArray.map((dto) => {
      const delivery = new Delivery();

      delivery.status = dto.status;
      delivery.qty = dto.qty;
      // Mengasumsikan relasi sudah terdefinisi di entity Delivery
      // Assign relasi menggunakan hanya ID untuk efisiensi
      // Tergantung pada ORM dan setup database Anda, Anda mungkin perlu memuat entity terlebih dahulu
      if (dto.kurirId) {
        delivery.courier = { id: dto.kurirId } as Courier; // Type casting untuk menghindari error tipe
      }

      if (dto.itemsId) {
        // Jika items adalah array atau relasi banyak-ke-banyak, Anda perlu menyesuaikan pendekatan ini
        delivery.items = { id: dto.itemsId } as Items;
      }

      if (dto.customersId) {
        delivery.customers = { id: dto.customersId } as Customers;
      }

      return delivery;
    });

    // Lanjutkan dengan proses penyimpanan atau operasi lainnya...

    // Save all delivery entities
    // TypeORM's save method can handle arrays, saving all instances in a single call
    return await this.deliveryRepository.save(deliveries);
  }

  async update(id: number, data: DeliveryDto): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['courier', 'items', 'customers'],
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }

    if (data.status) {
      delivery.status = data.status;
    }
    if (data.kurirId) {
      delivery.courier.id = data.kurirId;
    }
    if (data.itemsId) {
      delivery.items.id = data.itemsId;
    }
    if (data.customersId) {
      delivery.customers.id = data.customersId;
    }

    await this.deliveryRepository.save(delivery);
    return delivery;
  }
}
