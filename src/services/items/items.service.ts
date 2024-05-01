import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Items } from 'src/TypeOrm/entities/items.entity';
import { ItemsDto } from 'src/dto/ItemsDto';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items)
    private readonly itemsRepository: Repository<Items>,
  ) {}

  async findAll(): Promise<ItemsDto[]> {
    const res = await this.itemsRepository.find();
    return plainToClass(ItemsDto, res);
  }
}
