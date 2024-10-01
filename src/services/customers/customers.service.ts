import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as PDFDocument from 'pdfkit';
import { Customer } from 'src/TypeOrm/entities/customer.entity';

import { Repository } from 'typeorm';
import { User } from 'src/TypeOrm/entities/user.entity';
import {
  CreateCustomerDto,
  CreateOpsiCustomerDto,
  CustomerDto,
  CustomerInvoiceWithProductsDto,
  PaginationCustomer,
  UpdateCustomerDto,
} from 'src/dto/customersDto';

import { Role } from 'src/enum/role';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { OrderStatus } from 'src/enum/status';
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const { pin, name, phoneNumber, address } = createCustomerDto;

    // Validate PIN length
    if (pin.length !== 6) {
      throw new BadRequestException('PIN Harus 6 Karakter.');
    }

    // Check if the phoneNumber already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: phoneNumber },
    });

    if (existingUser) {
      throw new ConflictException('Nomor telepon sudah terdaftar.');
    }
    const hashedPassword = await bcrypt.hash(pin, 10);
    // Create new user
    const newUser = new User();
    newUser.id = uuidv4();
    newUser.username = phoneNumber;
    newUser.name = name;
    newUser.password = hashedPassword; // Consider hashing the password
    newUser.role = Role.CUSTOMER;

    const savedUser = await this.userRepository.save(newUser);

    // Create new customer linked to the user
    const customer = new Customer();
    customer.id = uuidv4();
    customer.name = name;
    customer.phoneNumber = phoneNumber;
    customer.points = 0;
    customer.address = address;
    customer.user = savedUser;

    return await this.customerRepository.save(customer);
  }

  async createOpsiCustomer(
    createCustomerDto: CreateOpsiCustomerDto,
  ): Promise<{ customer: Customer; userId: string | null }> {
    const {
      pin = '123456', // Default PIN
      name = null, // Nama bisa null
      phoneNumber = null, // PhoneNumber bisa null
      address,
    } = createCustomerDto;

    // Validate bahwa address disediakan
    if (!address) {
      throw new BadRequestException('Alamat wajib diisi.');
    }

    // Default PIN harus 6 karakter
    if (pin.length !== 6) {
      throw new BadRequestException('PIN harus 6 karakter.');
    }

    // Jika phoneNumber tidak ada, buat username berdasarkan tanggal dan urutan
    let username: string;
    if (phoneNumber) {
      username = phoneNumber;
    } else {
      // Dapatkan tanggal saat ini dalam format YYYYMMDD
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}${month}${day}`;

      // Dapatkan urutan user yang telah terdaftar (total user + 1)
      const userCount = await this.userRepository.count();
      const order = userCount + 1; // Urutan berdasarkan jumlah user yang ada

      // Gabungkan tanggal dan urutan untuk membentuk username
      username = `${dateString}-${order}`;
    }

    // Hash password dengan PIN
    const hashedPassword = await bcrypt.hash(pin, 10);

    // Buat user baru
    const newUser = new User();
    newUser.id = uuidv4();
    newUser.username = username; // Username hasil dari phoneNumber atau tanggal dan urutan
    newUser.name = name; // Nama bisa null
    newUser.password = hashedPassword; // Password di-hash
    newUser.role = Role.CUSTOMER;

    const savedUser = await this.userRepository.save(newUser);

    // Buat customer baru terkait dengan user
    const customer = new Customer();
    customer.id = uuidv4();
    customer.name = name; // Nama bisa null
    customer.phoneNumber = phoneNumber; // Bisa null
    customer.points = 0;
    customer.address = address;
    customer.user = savedUser; // Tetap link ke user yang baru dibuat

    const savedCustomer = await this.customerRepository.save(customer);

    // Return customer dan userId
    return {
      customer: savedCustomer,
      userId: savedUser.id, // Mengembalikan userId
    };
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    console.log(`Looking for customer with ID: ${customerId}`);

    const customer = await this.customerRepository.findOne({
      where: {
        user: { id: customerId },
      },
    });

    if (!customer) {
      console.error('Customer not found');
      throw new NotFoundException('Customer not found');
    }

    console.log('Customer found:', customer);

    return customer;
  }

  async getCustomerAll() {
    const customers = await this.customerRepository.find({
      relations: ['user'],
    });

    // Mapping customer ke DTO secara manual
    return customers.map((customer) => {
      const customerDto = new CustomerDto();
      customerDto.id = customer.id;
      customerDto.userId = customer.user.id; // Mapping user.id ke userId
      customerDto.points = customer.points;
      customerDto.address = customer.address;
      customerDto.phoneNumber = customer.phoneNumber;
      customerDto.name = customer.name;

      return customerDto;
    });
  }

  async getPaginatedCustomers(
    page: number,
    limit: number,
  ): Promise<PaginationCustomer> {
    console.log(`Fetching page ${page} with limit ${limit}`);

    const [customers, total] = await this.customerRepository.findAndCount({
      relations: ['user'],
      take: limit,
      skip: (page - 1) * limit,
    });

    console.log(`Total customers found: ${total}`);

    if (total === 0) {
      throw new NotFoundException('Customers not found');
    }

    const totalPages = Math.ceil(total / limit);
    console.log(`Total pages: ${totalPages}`);

    const customerDtos = customers.map((customer) => {
      const customerDto = new CustomerDto();
      customerDto.id = customer.id;
      customerDto.userId = customer.user.id;
      customerDto.points = customer.points;
      customerDto.address = customer.address;
      customerDto.phoneNumber = customer.phoneNumber;
      customerDto.name = customer.name;

      return customerDto;
    });

    return { customers: customerDtos, totalPages };
  }

  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    const updatedCustomer = { ...customer, ...updateCustomerDto };
    return this.customerRepository.save(updatedCustomer);
  }

  async getCustomersWithDebt(): Promise<CustomerInvoiceWithProductsDto[]> {
    const customersWithDebt = await this.customerRepository
      .createQueryBuilder('customer')
      .innerJoinAndSelect('customer.invoices', 'invoice')
      .innerJoinAndSelect(
        'invoice.order',
        'order',
        'invoice.status = :status',
        {
          status: 'Hutang',
        },
      ) // Filter hanya orders yang statusnya hutang
      .innerJoinAndSelect('order.orderProducts', 'orderProduct')
      .innerJoinAndSelect('orderProduct.product', 'product')
      .getMany();

    if (!customersWithDebt.length) {
      throw new NotFoundException('No customers with debt found');
    }

    // Map hasil query ke dalam DTO yang sudah kita buat
    return customersWithDebt.map((customer) => ({
      customerId: customer.id,
      name: customer.name,
      address: customer.address,
      debt: customer.debt,
      phoneNumber: customer.phoneNumber,
      invoices: customer.invoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        createdAt: invoice.createdAt,
      })),
      purchasedProducts: customer.invoices.flatMap((invoice) =>
        invoice.order.orderProducts.map((orderProduct) => ({
          id: orderProduct.id,
          product: {
            id: orderProduct.product.id,
            name: orderProduct.product.name,
            price: orderProduct.product.price,
          },
          quantity: orderProduct.quantity,
        })),
      ),
    }));
  }

  async cetakPiutangByCustomer(customerId: string): Promise<Buffer> {
    const customer = await this.customerRepository.find({
      where: { id: customerId, invoices: { status: OrderStatus.HUTANG } },
      relations: ['invoices', 'invoices.order.orderProducts.product'],
    });

    if (!customer || customer.length === 0) {
      throw new Error('Tidak ada hutang yang bisa diBayar');
    }

    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    // Configurations
    const margin = { top: 5, bottom: 5, left: 5, right: 5 };
    const width = 58 * 2.83465; // Ukuran kertas thermal 58 mm dalam poin
    const defaultHeight = 150 * 2.83465;

    // Ukuran dokumen PDF
    doc.addPage({
      size: [width, defaultHeight],
      margins: margin,
    });

    // Header
    doc.fontSize(9).text('Invoice Piutang', { align: 'center' });
    doc.text('Depo Isi Ulang Rizky Cendani 2', { align: 'center' });
    doc.text('Griya Asri Mahoni', { align: 'center' });
    doc.text('Telp: 0812-9548-9405', { align: 'center' });
    doc.moveDown(0.3);

    doc
      .fontSize(8)
      .text('Tanggal: ' + new Date().toLocaleDateString(), { align: 'center' });
    doc.moveDown(0.3);

    doc.fontSize(8).text(`Nama: ${customer[0].name}`, { align: 'left' });
    doc.text(`Alamat: ${customer[0].address || 'Alamat tidak tersedia'}`, {
      align: 'left',
    });
    doc.moveDown(0.3);

    let grandTotal = 0;

    // Iterasi melalui invoice
    // Iterasi melalui invoice
    const ordersByDate = customer
      .flatMap((invoice) =>
        invoice.invoices.map((order) => ({
          date: order.createdAt,
          formattedDate: this.formatDate(order.createdAt), // Format date menjadi ddmmyy
          products: order.order.orderProducts,
        })),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Urutkan dari yang paling lama ke yang terbaru
      .reduce(
        (acc, { formattedDate, products }) => {
          if (!acc[formattedDate]) acc[formattedDate] = [];
          acc[formattedDate].push(...products);
          return acc;
        },
        {} as Record<string, any[]>,
      );
    // Tulis data ke PDF
    for (const [date, products] of Object.entries(ordersByDate)) {
      // Header Tabel
      const tableWidth = width - 10;
      const columnWidths = {
        qty: 17,
        subtotal: 10,
        barang: tableWidth,
        date: 4,
      };

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
      let dateTotal = 0;
      products.forEach((orderProduct) => {
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
        doc.moveDown(0.3);

        dateTotal += totalPrice;
        grandTotal += totalPrice;
      });

      // Total per Tanggal
      doc.moveDown(0.3);
      doc.fontSize(10).text(`Total ${date}: Rp ${dateTotal.toLocaleString()}`, {
        align: 'right',
      });

      this.drawLine(doc, tableWidth);
      doc.moveDown(0.3);

      // Menghentikan pembuatan halaman jika konten sudah mencapai batas
      if (doc.y > defaultHeight - 50) {
        doc.addPage({
          size: [width, defaultHeight],
          margins: margin,
        });
      }
    }

    // Total Keseluruhan
    doc.moveDown(0.3);
    doc
      .fontSize(12)
      .text(`Total: Rp ${grandTotal.toLocaleString()}`, { align: 'right' });

    // Footer
    doc.moveDown(0.3);
    doc
      .fontSize(7)
      .text('Terima kasih atas perhatian Anda!', { align: 'center' });

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
    doc.moveDown(0.2);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2); // Mengambil 2 digit terakhir tahun
    return `${day}/${month}/${year}`;
  }
}
