import { Role } from 'src/enum/role';
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Order } from './order.entity';
import { Notification } from './notification.entity';
import { Customer } from './customer.entity';
import { Courier } from './courier.entity';

export enum UserRole {
  COURIER = 'courier',
  FILLER = 'filler',
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => Courier, (courier) => courier.user)
  couriers: Courier[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
