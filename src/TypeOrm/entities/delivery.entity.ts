import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Courier } from './courier.entity';
import { Order } from './order.entity';
import { DeliveryStatus } from 'src/enum/status';

@Entity('deliveries')
export class Delivery {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @ManyToOne(() => Courier, (courier) => courier.deliveries)
  courier: Courier;

  @ManyToOne(() => Order, (order) => order.deliveries)
  order: Order;

  @Column({ type: 'char', length: 36 })
  courierId: string;

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
}
