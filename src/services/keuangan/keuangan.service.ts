import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateKeuangan,
  CreateKeuanganOrder,
  GetSaldo,
  KeuanganResponseDto,
} from 'src/dto/keuangan.dto';
import { JenisTransaksi, Keuangan } from 'src/TypeOrm/entities/keuangan.entity';
import { Repository } from 'typeorm';

@Injectable()
export class KeuanganService {
  constructor(
    @InjectRepository(Keuangan)
    private keuanganRepository: Repository<Keuangan>,
  ) {}

  async getSaldo(): Promise<GetSaldo> {
    const pemasukan = await this.keuanganRepository.find({
      where: { jenisTransaksi: JenisTransaksi.PEMASUKAN },
    });

    const pengeluaran = await this.keuanganRepository.find({
      where: { jenisTransaksi: JenisTransaksi.PENGELUARAN },
    });

    const totalPemasukan = pemasukan.reduce(
      (total, item) => total + item.jumlah,
      0,
    );
    const totalPengeluaran = pengeluaran.reduce(
      (total, item) => total + item.jumlah,
      0,
    );
    const saldoAsli = totalPemasukan - totalPengeluaran;

    return {
      saldoAsli,
    };
  }

  async getKeuangan(): Promise<KeuanganResponseDto> {
    const keuangan = await this.keuanganRepository.find();
    const pemasukan = await this.keuanganRepository.find({
      where: { jenisTransaksi: JenisTransaksi.PEMASUKAN },
    });

    const pengeluaran = await this.keuanganRepository.find({
      where: { jenisTransaksi: JenisTransaksi.PENGELUARAN },
    });

    const totalPemasukan = pemasukan.reduce(
      (total, item) => total + item.jumlah,
      0,
    );
    const totalPengeluaran = pengeluaran.reduce(
      (total, item) => total + item.jumlah,
      0,
    );
    const saldoAsli = totalPemasukan - totalPengeluaran;

    return {
      keuangan,
      summary: {
        totalPemasukan,
        totalPengeluaran,
        saldoAsli,
      },
    };
  }

  async catatPendapatanOrder(data: CreateKeuanganOrder): Promise<void> {
    const { customerId, orderId, totalAmount } = data;
    // Ambil saldo terakhir (misalnya dari entitas keuangan atau sumber lain)
    const previousSaldo = await this.getLatestSaldo();

    // Buat entri pemasukan di keuangan
    const pemasukan = new Keuangan();
    pemasukan.deskripsi = `Pendapatan dari pesanan ID: ${orderId}, customer ID: ${customerId}`;
    pemasukan.jenisTransaksi = JenisTransaksi.PEMASUKAN;
    pemasukan.jumlah = totalAmount;
    pemasukan.saldo = previousSaldo + totalAmount;
    pemasukan.tanggal = new Date();

    // Simpan ke dalam entitas keuangan
    await this.keuanganRepository.save(pemasukan);
  }

  async catatKeuangan(data: CreateKeuangan) {
    const { deskripsi, jumlah, jenisTransaksi } = data;
    const previousSaldo = await this.getLatestSaldo();

    // Tentukan jenis transaksi, default ke PEMASUKAN jika jenisTransaksi tidak diberikan
    const transaksi = jenisTransaksi || JenisTransaksi.PENGELUARAN;

    const pengeluaran = new Keuangan();
    pengeluaran.deskripsi = deskripsi;
    pengeluaran.jenisTransaksi = transaksi;
    pengeluaran.jumlah = jumlah;
    pengeluaran.tanggal = new Date();

    // Atur saldo berdasarkan jenis transaksi
    if (transaksi === JenisTransaksi.PEMASUKAN) {
      pengeluaran.saldo = previousSaldo + jumlah;
    } else {
      pengeluaran.saldo = previousSaldo - jumlah;
    }

    await this.keuanganRepository.save(pengeluaran);
  }

  async catatPendapatanKeuangan(data: Keuangan) {
    const { deskripsi, saldo, jumlah } = data;
    const previousSaldo = await this.getLatestSaldo();

    const pengeluaran = new Keuangan();
    pengeluaran.deskripsi = deskripsi;
    pengeluaran.jenisTransaksi = JenisTransaksi.PENGELUARAN;
    pengeluaran.jumlah = jumlah;
    pengeluaran.saldo = previousSaldo + saldo;
    pengeluaran.tanggal = new Date();

    await this.keuanganRepository.save(pengeluaran);
  }

  private async getLatestSaldo(): Promise<number> {
    // Cari semua transaksi keuangan, urutkan berdasarkan tanggal secara descending
    const latestTransactions = await this.keuanganRepository.find({
      order: { tanggal: 'DESC' },
      take: 1, // Ambil hanya satu transaksi terakhir
    });

    if (latestTransactions.length === 0) {
      // Jika tidak ada transaksi, kembalikan saldo awal (0)
      return 0;
    }

    return latestTransactions[0].saldo;
  }
}
