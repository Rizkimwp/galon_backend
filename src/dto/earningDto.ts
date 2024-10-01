import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ProductDetailDTO {
  @ApiProperty({ example: 'RO Reverse Osmosis' })
  productName: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 8000 })
  price: number;
}

export class DeliveryDetailDTO {
  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerAddress: string;
}

export class CourierSalarySlipDTO {
  @ApiProperty({ example: 'Pa Sidik' })
  courierName: string;

  @ApiProperty()
  tanggal: string;

  @ApiProperty({ example: 4000 })
  totalEarnings: number;

  @ApiProperty({ type: [DeliveryDetailDTO] })
  details: DeliveryDetailDTO[];
}

export class GetCourierSalarySlipDTO {
  @IsOptional()
  @ApiProperty()
  @IsDateString()
  date?: Date;

  @ApiProperty()
  courierId: string;
}
