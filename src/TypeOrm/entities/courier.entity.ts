import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Delivery } from './delivery.entity';

@Entity('couriers')
export class Courier {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string; // Primary key to uniquely identify a Courier

  @ManyToOne(() => User, (user) => user.couriers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Adding name column

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string; // Adding phone number column

  @OneToMany(() => Delivery, (delivery) => delivery.courier)
  deliveries: Delivery[];
}
