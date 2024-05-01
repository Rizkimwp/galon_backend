import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Delivery } from './delivery.entity';

@Entity({ name: 'courier' })
export class Courier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ApiProperty()
  nama: string;

  @Column()
  @ApiProperty()
  nomor_telepon: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @OneToMany(() => Delivery, (delivery) => delivery.courier)
  delivery: Delivery;
}
