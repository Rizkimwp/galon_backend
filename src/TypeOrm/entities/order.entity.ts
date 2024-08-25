import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

import { OrderProduct } from './orderproduct.entity';
import { Delivery } from './delivery.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer;

  @Column({ default: 'Pending' })
  status: string; // Misal: 'Pending', 'Delivered', 'Failed'

  @Column({ default: true })
  requiresDelivery: boolean;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
