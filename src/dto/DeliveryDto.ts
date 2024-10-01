import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  IsDate,
  IsOptional,
} from 'class-validator';
import { ProductDto } from './orderDto';
import { DeliveryStatus } from 'src/enum/status';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courierId?: string;

  @ApiProperty({ description: 'Tanggal pembuatan entitas', required: false })
  @IsDate()
  @IsOptional()
  createdAt?: Date;
}

export class DeliveryDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  totalPrice: number;
}

export class SimpleProductOrderDTO {
  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  photo: string;
}

export class SimpleDeliveryDTO {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  orderDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [SimpleProductOrderDTO] })
  products: SimpleProductOrderDTO[];
}

export class DeliveryAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: DeliveryStatus }) // Properti enum harus menggunakan 'enum' daripada 'type'
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty()
  courierId: string;

  @ApiProperty()
  courierName: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerAddress: string;

  @ApiProperty()
  customerPhoneNumber: string;

  @ApiProperty()
  totalProducts: number;

  @ApiProperty({ type: [ProductDto] })
  products: ProductDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}

export class DeliveryReportProfitToday {
  @ApiProperty()
  @IsNumber()
  totalProfit: number;
}

export class UpdateDeliveryStatusDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty({ each: true })
  deliveryIds: string[];

  @ApiProperty()
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty()
  @IsUUID()
  courierId: string; // Kurir yang mengirimkan pengiriman
}

export class UpdateDeliveryStatusResponseDto {
  @ApiProperty({ description: 'Path to the generated invoice file' })
  invoicePath: string;
}
