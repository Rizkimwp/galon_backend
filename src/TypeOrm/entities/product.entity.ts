import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProduct } from './orderproduct.entity';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', precision: 10 })
  price: number;

  @Column({ type: 'int', precision: 10 })
  originalPrice: number; // Harga asli produk (bisa kosong jika tidak ada)

  @Column({ type: 'int', default: 0 })
  stock: number; // Jumlah stok yang tersedia

  @Column()
  description: string;

  @Column({ nullable: true })
  photo: string; // Menambahkan kolom untuk foto produk

  @Column({ type: 'int', default: 0 })
  rating: number; // Menambahkan kolom rating produk

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orderProducts: OrderProduct[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
