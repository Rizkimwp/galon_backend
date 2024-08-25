// src/orders/dto/order-get.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsString } from 'class-validator';
import { Product } from './productDto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    description: 'The list of products in the order',
    type: [Product], // Indicates an array of Product DTOs
    example: [{ id: 1, quantity: 2 }],
  })
  @IsArray()
  @Type(() => Product) // Transforms each item in the array to an instance of Product
  products: Product[];

  @ApiProperty({
    description: 'The status of the order',
    example: 'pending',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Id User',
  })
  @IsString()
  userId: string;
}
