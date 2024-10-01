import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Reward } from './reward.entity';

@Entity('redeems')
export class Redeem {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string; // Unique ID untuk setiap transaksi penukaran reward

  @ManyToOne(() => Customer, (customer) => customer.redeems)
  @JoinColumn({ name: 'customerId' })
  customer: Customer; // Relasi ke customer yang menukarkan reward

  @ManyToOne(() => Reward, (reward) => reward.redeems)
  @JoinColumn({ name: 'rewardId' })
  reward: Reward; // Relasi ke reward yang ditukarkan

  @CreateDateColumn({ type: 'timestamp' })
  redeemedAt: Date; // Tanggal dan waktu ketika reward ditukarkan

  @Column({ type: 'int' })
  pointsUsed: number; // Jumlah poin yang digunakan untuk menukar reward
}
