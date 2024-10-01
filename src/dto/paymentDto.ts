import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'UUID-invoice-id' })
  @IsNotEmpty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ example: '2024-09-11' })
  @IsNotEmpty()
  paymentDate: Date;

  @ApiProperty({ example: 50000.0 })
  @IsNotEmpty()
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ example: 'Cash' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;
}

export class PayDebtDto {
  @ApiProperty({ example: 'uuid-user-id' })
  customerId: string;

  @ApiProperty({ example: 25000 })
  amount: number; // Jumlah yang ingin dibayar
}
