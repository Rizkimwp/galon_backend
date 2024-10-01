import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Courier } from './courier.entity';
import { Delivery } from './delivery.entity';

@Entity('courier_earnings')
export class CourierEarnings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Courier, { eager: true })
  courier: Courier;

  @ManyToOne(() => Delivery, { eager: true })
  delivery: Delivery;

  @Column('int', { default: 0 })
  amount: number; // Penghasilan dari pengiriman

  @CreateDateColumn()
  createdAt: Date; // Tanggal dan waktu pencatatan penghasilan
}
