import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CourierDto,
  CreateCourierDto,
  UpdateCourierDto,
} from 'src/dto/courierDto';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class CourierService {
  constructor(
    @InjectRepository(Courier)
    private readonly courierRepository: Repository<Courier>,
  ) {}

  async findAll(): Promise<CourierDto[]> {
    const couriers = await this.courierRepository.find();
    return couriers.map((courier) => ({
      id: courier.id,
      name: courier.name,
      phoneNumber: courier.phoneNumber,
    }));
  }

  async create(createCourierDto: CreateCourierDto): Promise<Courier> {
    const courier = this.courierRepository.create({
      ...createCourierDto,
      id: uuidv4(),
    });
    return await this.courierRepository.save(courier);
  }

  async update(
    id: string,
    updateCourierDto: UpdateCourierDto,
  ): Promise<Courier> {
    const courier = await this.courierRepository.preload({
      id,
      ...updateCourierDto,
    });
    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }
    return this.courierRepository.save(courier);
  }

  async delete(id: string): Promise<void> {
    const result = await this.courierRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }
  }
}
