import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Payment } from './payment.entity';
import { Order } from './order.entity';
import { OrderStatus } from 'src/enum/status';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'varchar', length: 50 })
  invoiceNumber: string;

  @Column('int', { default: 0 })
  totalAmount: number; // Change to number if possible

  @Column('int', { default: 0 })
  paidAmount: number; // Change to number if possible

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Order, (order) => order.invoice)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @UpdateDateColumn()
  updatedAt: Date;
}
