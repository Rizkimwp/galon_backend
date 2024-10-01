import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { OrderStatus } from 'src/enum/status';
import { InvoiceWithDebtDto } from 'src/dto/invoiceDto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async generateInvoiceDelivery(deliveryIds: string[]): Promise<Buffer> {
    // Mengambil data delivery berdasarkan deliveryIds yang diberikan
    const deliveryIdsArray = Array.isArray(deliveryIds)
      ? deliveryIds
      : [deliveryIds];

    const deliveries = await this.deliveryRepository.find({
      where: { id: In(deliveryIdsArray) },
      relations: [
        'order',
        'order.customer',
        'order.orderProducts',
        'order.orderProducts.product',
        'courier',
      ],
    });

    // Jika tidak ada pengiriman ditemukan, throw exception
    if (deliveries.length === 0) {
      throw new NotFoundException(
        'Tidak ada pengiriman untuk dibuatkan faktur',
      );
    }

    // Membuat dokumen PDF baru
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    // Menyimpan data PDF ke dalam buffer
    doc.on('data', buffers.push.bind(buffers));

    // Memulai membuat konten PDF
    const margin = { top: 5, bottom: 5, left: 5, right: 5 };
    const width = 58 * 2.83465; // Ukuran kertas thermal 58 mm dalam poin
    const defaultHeight = 150 * 2.83465;

    // Ukuran dokumen PDF
    doc.addPage({
      size: [width, defaultHeight],
      margins: margin,
    });

    // Header Invoice
    // Header Invoice
    doc.fontSize(9).text('INVOICE PENGIRIMAN', { align: 'center' });
    doc.text('Depo Isi Ulang Rizky Cendani 2', { align: 'center' });
    doc.text('Griya Asri Mahoni', { align: 'center' });
    doc.text('Telp: 0812-9548-9405', { align: 'center' });
    doc.moveDown(0.3);

    const courierName = deliveries[0].courier?.name || 'Kurir tidak tersedia';
    doc.fontSize(8).text(`${courierName}`, { align: 'center' });
    doc.moveDown(0.3);

    let grandTotal = 0;

    // Iterasi melalui pengiriman untuk menghasilkan tabel
    for (const delivery of deliveries) {
      if (delivery.order?.orderProducts?.length) {
        const customerName =
          delivery.order?.customer?.name || 'Pelanggan tidak ditemukan';
        const customerAddress =
          delivery.order?.customer?.address || 'Alamat tidak tersedia';

        // Informasi Pelanggan
        doc.fontSize(7).text(`Pelanggan: ${customerName}`);
        doc.text(`Alamat: ${customerAddress}`);
        doc.moveDown(0.3);

        // Nama Kurir

        // Header Tabel Barang
        const tableWidth = width - 10;
        const columnWidths = { qty: 17, subtotal: 10, barang: tableWidth };

        doc.fontSize(8);
        doc.text('Barang', { continued: true, width: columnWidths.barang });
        doc.text('Qty', {
          align: 'center',
          width: columnWidths.qty,
          continued: true,
        });
        doc.text('Subtotal', { align: 'right', width: columnWidths.subtotal });
        this.drawLine(doc, tableWidth);

        // Body Tabel Barang
        delivery.order.orderProducts.forEach((orderProduct) => {
          const productName =
            orderProduct.product?.name || 'Produk tidak dikenal';
          const quantity = orderProduct.quantity || 0;
          const price = orderProduct.product?.price || 0;
          const totalPrice = quantity * price;

          doc.text(`${productName}`, {
            continued: true,
            width: columnWidths.barang,
          });
          doc.text(`${quantity}x${price}`, {
            align: 'center',
            width: columnWidths.qty,
            continued: true,
          });
          doc.text(`${totalPrice}`, {
            align: 'right',
            width: columnWidths.subtotal,
          });

          grandTotal += totalPrice;
        });

        this.drawLine(doc, tableWidth);
        doc.moveDown(0.3);
      } else {
        doc.text('Tidak ada produk yang ditemukan untuk pengiriman ini.');
        doc.moveDown(0.3);
      }
    }

    // Total Keseluruhan
    doc.moveDown(0.3);
    doc.fontSize(12).text(`Total: Rp ${grandTotal}`, { align: 'right' });

    // Footer Invoice
    doc.moveDown(0.3);
    doc
      .fontSize(7)
      .text('Terima kasih atas pesanan Anda!', { align: 'center' });
    doc.text('Barang yang dibeli tidak dapat dikembalikan.', {
      align: 'center',
    });

    doc.end();

    // Menggabungkan seluruh buffer dan mengembalikannya
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
  }

  // Utility function untuk menggambar garis
  private drawLine(doc: PDFDocument, width: number) {
    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.x + width, doc.y)
      .stroke();
    doc.moveDown(0.2); // Pindah ke bawah setelah menggambar garis
  }

  async getInvoicesWithDebt(): Promise<InvoiceWithDebtDto[]> {
    // Mengambil semua orders yang statusnya 'Hutang'
    const orders = await this.orderRepository.find({
      where: { invoice: { status: OrderStatus.HUTANG } },
      relations: [
        'customer',
        'orderProducts',
        'orderProducts.product',
        'invoice',
      ],
    });

    return orders
      .map((order) => {
        // Periksa apakah invoice ada
        if (!order.invoice) {
          // Jika invoice tidak ada, kembalikan null atau objek yang sesuai
          return null;
        }

        const invoice = order.invoice;

        return {
          invoiceNumber: invoice.invoiceNumber || null, // Jika invoiceNumber tidak ada, tampilkan null
          dueDate: invoice.dueDate || null, // Jika dueDate tidak ada, tampilkan null
          namaCustomer: order.customer.name || null,
          customerId: order.customer.id || null, // Jika namaCustomer tidak ada, tampilkan null
          alamatCustomer: order.customer.address || null, // Jika alamatCustomer tidak ada, tampilkan null
          totalAmount: order.customer.debt || null, // Jika totalAmount tidak ada, tampilkan 0
          createdAt: invoice.createdAt,
          orderDate: order.createdAt,
          status: invoice.status,
          products: order.orderProducts.map((orderProduct) => ({
            productId: orderProduct.product?.id || null, // Jika productId tidak ada, tampilkan null
            name: orderProduct.product?.name || null, // Jika nama produk tidak ada, tampilkan null
            quantity: orderProduct.quantity || 0, // Jika quantity tidak ada, tampilkan 0
            price: orderProduct.product?.price || 0, // Jika price tidak ada, tampilkan 0
          })),
        };
      })
      .filter((item) => item !== null); // Filter untuk menghapus item null dari hasil
  }
}
