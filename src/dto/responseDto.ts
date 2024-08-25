import { ApiProperty } from '@nestjs/swagger';

export class CreateGallonResponseDto {
  @ApiProperty({ example: 'Gallon has been successfully created.' })
  message: string;
}

export class UpdateTransactionResponseDto {
  @ApiProperty({ example: 'Transaksi Berhasil' })
  message: string;
}
