import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from 'src/dto/paymentDto';
import { OrderStatus } from 'src/enum/status';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { Invoice } from 'src/TypeOrm/entities/invoice.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { Payment } from 'src/TypeOrm/entities/payment.entity';
import { Repository } from 'typeorm';
import { KeuanganService } from '../keuangan/keuangan.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private keuanganService: KeuanganService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { invoiceId, paymentDate, amountPaid, paymentMethod } =
      createPaymentDto;

    // Cari invoice berdasarkan ID
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // Buat entitas Payment baru
    const payment = this.paymentRepository.create({
      invoice,
      paymentDate,
      amountPaid,
      paymentMethod,
    });

    // Simpan pembayaran
    await this.paymentRepository.save(payment);

    // Update status invoice jika sudah lunas
    const totalPaid =
      (
        await this.paymentRepository
          .createQueryBuilder('payment')
          .select('SUM(payment.amountPaid)', 'total')
          .where('payment.invoiceId = :invoiceId', { invoiceId })
          .getRawOne()
      )?.total ?? 0;

    if (totalPaid >= invoice.totalAmount) {
      invoice.status = OrderStatus.LUNAS; // Update status invoice menjadi lunas
      await this.invoiceRepository.save(invoice);
    }

    return payment;
  }
  async payDebt(customerId: string, amountToPay: number) {
    const invoiceRepository = this.invoiceRepository;
    const paymentRepository = this.paymentRepository;
    const customerRepository = this.customerRepository;
    const orderRepository = this.orderRepository; // Tambahkan repository untuk Order

    // Temukan customer berdasarkan ID
    const customer = await customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Cari semua invoice yang masih berstatus hutang untuk customer terkait
    const invoices = await invoiceRepository.find({
      where: { customer: { id: customerId }, status: OrderStatus.HUTANG },
      order: { createdAt: 'ASC' },
      relations: ['order'], // Proses invoice yang paling tua terlebih dahulu
    });

    if (!invoices.length) {
      throw new NotFoundException('No pending invoices found');
    }

    let remainingAmount = amountToPay;

    for (const invoice of invoices) {
      if (remainingAmount <= 0) break; // Keluar dari loop jika pembayaran sudah habis diproses

      // Hitung jumlah yang masih harus dibayar untuk invoice ini
      const outstandingAmount =
        Number(invoice.totalAmount) - Number(invoice.paidAmount);

      // Tentukan berapa banyak yang akan dibayar untuk invoice ini
      const paymentAmount = Math.min(outstandingAmount, remainingAmount);

      // Buat record pembayaran baru
      const payment = paymentRepository.create({
        invoice,
        paymentDate: new Date(),
        amountPaid: paymentAmount,
        paymentMethod: 'Cash', // Bisa disesuaikan sesuai input dari frontend
      });
      await paymentRepository.save(payment);

      // Update jumlah yang sudah dibayar pada invoice
      invoice.paidAmount += paymentAmount;

      // Jika invoice telah lunas, tandai sebagai "Lunas" dan tambahkan poin
      if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.status = OrderStatus.LUNAS;

        // Ambil order terkait dari invoice
        const order = await orderRepository.findOne({
          where: { id: invoice.order.id }, // Pastikan ada relasi invoice dengan order
          relations: ['orderProducts', 'orderProducts.product'], // Muat juga orderProducts
        });

        if (order) {
          // Hitung poin untuk produk dalam order
          const pointsToAdd = order.orderProducts.reduce(
            (totalPoints, orderProduct) => {
              // Tambahkan 20 poin per produk yang dipesan
              return totalPoints + orderProduct.quantity * 20;
            },
            0,
          );

          // Tambahkan poin ke customer
          customer.points += pointsToAdd;
          await customerRepository.save(customer);

          const totalAmount = (order.orderProducts || []).reduce(
            (total, orderProduct) => {
              return total + orderProduct.quantity * orderProduct.product.price;
            },
            0,
          );
          await this.keuanganService.catatPendapatanOrder({
            orderId: order.id,
            customerId: customerId,
            totalAmount,
          });
        }
      }

      await invoiceRepository.save(invoice);

      // Kurangi sisa jumlah yang harus dibayar
      remainingAmount -= paymentAmount;
    }

    // Kurangi debt dari customer dengan jumlah yang dibayar
    customer.debt -= amountToPay - remainingAmount; // amountToPay dikurangi remainingAmount karena remainingAmount adalah sisa yang tidak terpakai
    await customerRepository.save(customer);

    if (remainingAmount > 0) {
      // Jika ada sisa uang setelah pembayaran, bisa disimpan atau dicatat
      console.log(`Remaining balance: ${remainingAmount}`);
    }
  }

  //-----------------------------
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { invoice: { id: invoiceId } },
      relations: ['invoice'],
    });
  }
}
