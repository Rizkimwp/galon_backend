import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  qty: number;
}
