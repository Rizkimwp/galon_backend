import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, Matches } from 'class-validator';

import { StatusPengiriman } from 'src/TypeOrm/entities/delivery.entity';

export class GetbyKurir {
  @IsInt()
  @ApiProperty()
  kurirId: number;
}

export class DeliveryDto {
  @Expose()
  id: number;

  @IsEnum(StatusPengiriman)
  @ApiProperty({
    enum: StatusPengiriman,
    description: 'The delivery status',
    enumName: 'StatusPengiriman',
    default: StatusPengiriman.PROSES,
  })
  status: StatusPengiriman;

  @ApiProperty() // Assuming items is an ID, it should be of type number
  @IsNumber()
  @IsNotEmpty()
  itemsId: number; // Representing the ID of the related Items entity

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  qty: number;

  @Expose()
  @IsNotEmpty()
  @ApiProperty()
  kurirId: number;

  @ApiProperty() // Assuming items is an ID, it should be of type number
  @IsNumber()
  @IsNotEmpty()
  customersId: number; // Representing the ID of the related Items entity
}

export class DeliveryQueryDto {
  @ApiProperty({ description: 'Courier ID' })
  @IsNotEmpty()
  readonly kurirId: number;

  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Tanggal must be in YYYY-MM-DD format',
  })
  readonly tanggal: string;
}

export class DeliveryToday {
  @ApiProperty({ description: 'Courier ID' })
  @IsNotEmpty()
  kurirId?: number;
}
