import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Customer } from './customer.entity';

import { OrderProduct } from './orderproduct.entity';
import { Delivery } from './delivery.entity';
import { OrderStatus } from 'src/enum/status';
import { Invoice } from './invoice.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer: Customer;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ default: true })
  requiresDelivery: boolean;

  @OneToOne(() => Invoice, (invoice) => invoice.order)
  invoice: Invoice; // Relasi ke faktur

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];

  @OneToMany(() => Delivery, (delivery) => delivery.order)
  deliveries: Delivery[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
