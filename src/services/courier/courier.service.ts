import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { CourierDto } from 'src/dto/CourierDto';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class CourierService {
  constructor(
    @InjectRepository(Courier)
    private readonly courierRepository: Repository<Courier>,
  ) {}

  async findAll(): Promise<CourierDto[]> {
    const res = await this.courierRepository.find();
    return plainToClass(CourierDto, res);
  }

  async findOne(id: number): Promise<Courier> {
    const courier = await this.courierRepository.findOne({ where: { id } });
    if (!courier) {
      throw new NotFoundException('Courier Not Found');
    }
    return courier;
  }

  async create(data: CourierDto): Promise<CourierDto> {
    const courier = await this.courierRepository.create(data);
    return await this.courierRepository.save(courier);
  }

  async update(id: number, data: CourierDto): Promise<Courier> {
    const courier = await this.courierRepository.findOne({ where: { id } });
    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    // Lakukan validasi hanya jika data yang diberikan ada
    if (data.nama) {
      courier.nama = data.nama;
    }
    if (data.nomor_telepon) {
      courier.nomor_telepon = data.nomor_telepon;
    }

    // Simpan perubahan
    await this.courierRepository.save(courier);

    return courier;
  }

  async delete(id: number): Promise<DeleteResult> {
    const courier = await this.courierRepository.findOne({ where: { id } });
    const deleteResult = await this.courierRepository.delete(courier);
    if (!courier) {
      throw new NotFoundException('Customer tidak ditemukan');
    }
    return deleteResult;
  }
}
