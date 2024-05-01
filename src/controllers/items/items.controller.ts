import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemsDto } from 'src/dto/ItemsDto';
import { ItemsService } from 'src/services/items/items.service';

@ApiTags('Items')
@Controller('api/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async getItems(): Promise<ItemsDto[]> {
    return await this.itemsService.findAll();
  }
}
