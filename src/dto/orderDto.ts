// src/orders/dto/order-get.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Product } from './productDto';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/enum/status';
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
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Indicates if the order requires delivery',
    example: true,
  })
  isDelivery: boolean;

  @ApiProperty({
    description: 'The ID of the user placing the order',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The ID of the courier assigned to the order, can be null',
    required: false,
    example: null,
  })
  @IsString()
  @IsOptional()
  courierId?: string | null;

  @ApiProperty({ description: 'Tanggal pembuatan entitas', required: false })
  @IsDate()
  @IsOptional()
  createdAt?: Date;
  // Allow courierId to be null or undefined
}

class ProductUpdate {
  @ApiProperty({
    description: 'The ID of the product to be updated',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'The quantity of the product',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateOrderCustomerProduct {
  @ApiProperty({
    description: 'The ID of the order being updated',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'The ID of the customer associated with the order',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({ type: [ProductUpdate] })
  @IsOptional()
  @IsArray()
  productUpdates?: ProductUpdate[];
}

export class UpdateOrderDto {
  @ApiProperty({
    description: 'The ID of the user placing the order',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'The ID of the user placing the order',
  })
  @IsUUID()
  courierId: string;

  @ApiProperty({ description: 'Tanggal pembuatan entitas', required: false })
  @IsOptional()
  createdAt?: Date;
}
export class CustomerDtoOrder {
  @ApiProperty()
  @IsUUID()
  id: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  name: string;
}
export class DeliveryDto {
  @IsUUID()
  @ApiProperty()
  id: string;

  @IsUUID()
  @ApiProperty()
  orderId: string;

  @IsString()
  @ApiProperty()
  status: string; // Misal: 'Pending', 'In Progress', 'Delivered'

  @IsDate()
  @ApiProperty()
  deliveredAt: Date;
}
export class ProductDto {
  @IsUUID()
  @ApiProperty()
  id: string;

  @IsInt()
  @ApiProperty()
  price: number;

  @ApiProperty()
  name: string;

  @IsInt()
  @ApiProperty()
  quantity: number;
}

export class OrderDto {
  @IsUUID()
  @ApiProperty()
  id: string;

  @ApiProperty()
  isDelivery: boolean;

  @ApiProperty()
  customer: CustomerDtoOrder;

  @ApiProperty({ enum: OrderStatus }) // Properti enum harus menggunakan 'enum' daripada 'type'
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @ApiProperty()
  totalprice: number;

  @ApiProperty({ type: [ProductDto] })
  products: ProductDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class UpdateOrderStatusDto {
  @IsArray()
  @ApiProperty()
  orderIds: string[];

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus; // Status pesanan
}

export class MonthlyReportDto {
  @ApiProperty({
    description: 'Tahun dari laporan',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: 'Bulan dari laporan (1 untuk Januari, 2 untuk Februari, dll.)',
    example: 1,
  })
  month: number;

  @ApiProperty({
    description: 'Jumlah order pada bulan tersebut',
    example: 120,
  })
  count: number;
}
