import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';
import { Invoice } from './invoice.entity';
import { Redeem } from './redeem.entity';

@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string; // Primary key to uniquely identify a Customer

  @ManyToOne(() => User, (user) => user.customers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string; // Adding name column

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string; // Adding phone number column

  @Column({ default: false })
  isVerified: boolean;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  debt: number;

  @Column({ type: 'text', nullable: true })
  address: string; // Address column

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Redeem, (redeem) => redeem.customer)
  redeems: Redeem[]; // Customer dapat menukarkan banyak reward
}
