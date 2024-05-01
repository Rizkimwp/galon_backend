import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CourierDto {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nomor_telepon: string;

  // Anda bisa menambahkan properti lain yang perlu divalidasi, misalnya nomor telepon, dll.
}
