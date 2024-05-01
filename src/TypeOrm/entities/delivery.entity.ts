import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Items } from './items.entity';
import { Courier } from './courier.entity';
import { Customers } from './customers.entity';

export enum StatusPengiriman {
  DIKIRIM = 'dikirim',
  PROSES = 'proses',
  GAGAL = 'gagal',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' }) // Menetapkan nilai default ke waktu saat in
  createAt: Date;

  @Column()
  @ApiProperty()
  qty: number;

  @Column({
    type: 'enum',
    enum: StatusPengiriman,
    default: StatusPengiriman.PROSES,
  })
  @ApiProperty()
  status: StatusPengiriman;

  @ManyToOne(() => Items, (item) => item.delivery, { eager: true })
  @JoinColumn({ name: 'itemsId' })
  @ApiProperty({ type: () => Items }) // Mengatur relasi dengan cascade
  items: Items;

  @ManyToOne(() => Courier, (kurir) => kurir.delivery, { eager: true }) // Relasi Many-to-One ke entitas Courier
  @JoinColumn({ name: 'kurirId' })
  @ApiProperty({ type: () => Courier })
  courier: Courier;

  @ManyToOne(() => Customers, (customers) => customers.delivery, {
    eager: true,
  }) // Relasi Many-to-One ke entitas Courier
  @JoinColumn({ name: 'customersId' })
  @ApiProperty({ type: () => Customers })
  customers: Customers;
}
