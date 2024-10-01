import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Courier } from './courier.entity';
import { Order } from './order.entity';
import { DeliveryStatus } from 'src/enum/status';
import { CourierEarnings } from './courier_earnings.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @ManyToOne(() => Courier, (courier) => courier.deliveries, { nullable: true })
  courier: Courier;

  @Column({ type: 'char', length: 36, nullable: true })
  courierId: string;

  @ManyToOne(() => Order, (order) => order.deliveries)
  order: Order;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PROSES, // Set default value if needed
  })
  status: DeliveryStatus;

  @Column()
  barcode: string; // Barcode yang di-scan oleh kurir

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => CourierEarnings, (earnings) => earnings.courier)
  earnings: CourierEarnings[];
}
