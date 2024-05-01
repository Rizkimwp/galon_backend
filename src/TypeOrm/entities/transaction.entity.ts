import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Items } from './items.entity';
import { Customers } from './customers.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'transaction' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  tanggalPembelian: Date;

  @Column()
  qty: number;

  @ManyToOne(() => Items, (item) => item.transaksi)
  @JoinColumn({ name: 'itemId' })
  @ApiProperty({ type: () => Items })
  items: Items;

  @ManyToOne(() => Customers, (customer) => customer.transaction)
  @JoinColumn({ name: 'customerId' })
  @ApiProperty({ type: () => Customers })
  customers: Customers;
}
