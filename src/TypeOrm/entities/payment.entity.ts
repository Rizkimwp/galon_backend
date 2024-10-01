import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountPaid: number;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string; // Misal: Cash, Transfer Bank

  @CreateDateColumn()
  createdAt: Date;
}
