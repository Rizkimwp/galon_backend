import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customers } from './customers.entity';

export enum StatusPembayaran {
  LUNAS = 'lunas',
  HUTANG = 'hutang',
}

@Entity({ name: 'debit' })
export class Debit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  tanggalTransaksi: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  jumlahHutang: number;

  @Column({ default: 0, type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  jumlahDibayar: number;

  @Column()
  @ApiProperty()
  tanggalJatuhTempo: Date;

  @Column({
    type: 'enum',
    default: StatusPembayaran.HUTANG,
    enum: StatusPembayaran,
  })
  @ApiProperty()
  status: StatusPembayaran;

  @ManyToOne(() => Customers, (customer) => customer.debit)
  @ApiProperty()
  @JoinColumn({ name: 'customerId' })
  customer: Customers;
}
