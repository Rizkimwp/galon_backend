import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courierId: string;
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
