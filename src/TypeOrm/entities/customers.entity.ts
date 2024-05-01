import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Debit } from './debit.entity';
import { Transaction } from './transaction.entity';
import { Delivery } from './delivery.entity';

@Entity({ name: 'customers' })
export class Customers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  nama: string;

  @Column()
  @ApiProperty()
  nomor_telepon: string;

  @Column()
  @ApiProperty()
  alamat: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' }) // Menetapkan nilai default ke waktu saat in
  createAt: Date;

  @OneToMany(() => Debit, (debit) => debit.customer)
  debit: Debit[];

  @OneToMany(() => Transaction, (transaction) => transaction.customers)
  transaction: Transaction;

  @OneToMany(() => Delivery, (delivery) => delivery.customers)
  delivery: Delivery;
}
