import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { StatusPembayaran } from 'src/TypeOrm/entities/debit.entity';

export class DebitDto {
  @IsDate()
  @IsNotEmpty()
  @Expose()
  tanggalTransaksi: Date;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  jumlahHutang: number;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  jumlahDibayar: number;

  @IsDate()
  @IsNotEmpty()
  @Expose()
  tanggalJatuhTempo: Date;

  @IsEnum({ StatusPembayaran })
  @IsNotEmpty()
  @Expose()
  status: StatusPembayaran;

  @IsNotEmpty()
  @Expose()
  customerId: number;
}
