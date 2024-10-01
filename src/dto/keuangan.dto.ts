import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { JenisTransaksi } from 'src/TypeOrm/entities/keuangan.entity';

export class CreateKeuangan {
  @ApiProperty()
  deskripsi: string;

  @ApiProperty()
  jumlah: number;

  @IsOptional()
  @ApiProperty({ enum: JenisTransaksi })
  @IsEnum(JenisTransaksi)
  jenisTransaksi?: JenisTransaksi;
}

export class KeuanganDto {
  @ApiProperty({
    example: 'uuid1',
    description: 'ID transaksi keuangan',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'Pesanan A',
    description: 'Deskripsi transaksi',
  })
  @IsString()
  deskripsi: string;

  @ApiProperty()
  @IsEnum(JenisTransaksi)
  jenisTransaksi: JenisTransaksi;

  @ApiProperty({
    example: 100000,
    description: 'Jumlah uang yang masuk atau keluar',
  })
  @IsNumber()
  jumlah: number;

  @ApiProperty({
    example: 100000,
    description: 'Saldo setelah transaksi',
  })
  @IsNumber()
  saldo: number;

  @ApiProperty({
    example: '2024-09-18T12:00:00.000Z',
    description: 'Tanggal transaksi',
  })
  @IsDate()
  tanggal: Date;
}

export class KeuanganSummaryDto {
  @ApiProperty({
    example: 250000,
    description: 'Total pemasukan dari semua transaksi',
  })
  @IsNumber()
  totalPemasukan: number;

  @ApiProperty({
    example: 50000,
    description: 'Total pengeluaran dari semua transaksi',
  })
  @IsNumber()
  totalPengeluaran: number;

  @ApiProperty({
    example: 200000,
    description: 'Saldo asli setelah menghitung pemasukan dan pengeluaran',
  })
  @IsNumber()
  saldoAsli: number;
}

export class KeuanganResponseDto {
  @ApiProperty({
    type: [KeuanganDto],
    description: 'Daftar semua pemasukan',
  })
  keuangan: KeuanganDto[];

  @ApiProperty({
    type: KeuanganSummaryDto,
    description: 'Ringkasan dari total pemasukan, pengeluaran, dan saldo asli',
  })
  summary: KeuanganSummaryDto;
}

export class CreateKeuanganOrder {
  @ApiProperty()
  orderId: string;
  @ApiProperty()
  customerId: string;
  @ApiProperty()
  totalAmount: number;
}

export class GetSaldo {
  @ApiProperty()
  saldoAsli: number;
}
