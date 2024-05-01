import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Delivery } from './delivery.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'items' })
export class Items {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  namaBarang: string;

  @Column()
  @ApiProperty()
  stok: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  harga: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  createAt: Date;

  @OneToMany(() => Delivery, (delivery) => delivery.items)
  delivery: Delivery;

  @OneToMany(() => Transaction, (transasksi) => transasksi.items)
  transaksi: Transaction;
}
