import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Redeem } from './redeem.entity';

@Entity('rewards')
export class Reward {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  pointsRequired: number; // Jumlah poin yang diperlukan untuk menukar hadiah

  @Column({ nullable: true })
  imageUrl: string; // URL gambar hadiah

  @OneToMany(() => Redeem, (redeem) => redeem.reward)
  redeems: Redeem[]; // Customer dapat menukarkan banyak reward
}
