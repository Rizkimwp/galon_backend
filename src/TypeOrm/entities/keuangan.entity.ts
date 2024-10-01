import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JenisTransaksi {
  PEMASUKAN = 'pemasukan',
  PENGELUARAN = 'pengeluaran',
}

@Entity('keuangan')
export class Keuangan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  tanggal: Date;

  @Column({ type: 'text' })
  deskripsi: string;

  @Column({ type: 'enum', enum: JenisTransaksi })
  jenisTransaksi: JenisTransaksi;

  @Column('int', { default: 0 })
  jumlah: number;

  @Column('int', { default: 0 })
  saldo: number;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
