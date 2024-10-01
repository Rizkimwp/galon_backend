import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/enum/status';

export class GenerateInvoiceDto {
  @ApiProperty()
  deliveryIds: string[];
}

export class ProductInvoiceDto {
  @ApiProperty({ example: '612a12cd-cb32-4885-9954-be0b58244a20' })
  productId: string;

  @ApiProperty({ example: 'Isi Ulang Dijual Lagi' })
  name: string;

  @ApiProperty({ example: 3 })
  quantity: number;

  @ApiProperty({ example: 4000 })
  price: number;
}
export class InvoiceWithDebtDto {
  @ApiProperty({ example: 'INV-1725930614796' })
  invoiceNumber: string;

  @ApiProperty({ example: 'INV-1725930614796' })
  customerId: string;

  @ApiProperty({ example: '2024-09-10' })
  dueDate: Date;

  @ApiProperty({ example: '2024-09-10' })
  orderDate: Date;

  @ApiProperty({ example: 12000 })
  totalAmount: number;

  @ApiProperty({ example: '2024-09-10' })
  createdAt: Date;

  @ApiProperty({ example: 'Mardi' })
  namaCustomer: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 'RC-05' })
  alamatCustomer: string;

  @ApiProperty({
    type: [ProductInvoiceDto],
    description: 'Daftar produk dalam invoice',
  })
  products: ProductInvoiceDto[];
}
