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

@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string; // Primary key to uniquely identify a Customer

  @ManyToOne(() => User, (user) => user.customers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Adding name column

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string; // Adding phone number column

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'int', default: 0 })
  debt: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'text', nullable: true })
  address: string; // Address column

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];
}
