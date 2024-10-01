import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDecimal } from 'class-validator';
import { Customer } from 'src/TypeOrm/entities/customer.entity';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'Name of the customer' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer',
  })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the customer',
    required: false,
  })
  address: string;
}
export class CreateOpsiCustomerDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123456',
    description: 'Pin of the customer',
    required: false,
  })
  pin?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the customer',
    required: false,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the customer',
    required: false,
  })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123 Main St',
    description: 'Address of the customer',
  })
  address: string;
}

export class CustomerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  @Expose()
  @IsDecimal()
  @IsOptional()
  points: number;

  @ApiProperty()
  @Expose()
  @IsDecimal()
  @IsOptional()
  debt: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  name: string;
}
export class OrderCustomerDto {
  @ApiProperty()
  id: number;
}
export class UpdateCustomerDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '08123456789', description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St', description: 'Customer address' })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateCustomerResponseDto {
  @ApiProperty()
  customer: Customer;
  @ApiProperty({ example: '123 Main St', description: 'Customer address' })
  @IsString()
  userId: string | null;
}

export class PaginationCustomer {
  @ApiProperty({
    description: 'List of customers',
    type: [CustomerDto],
  })
  customers: CustomerDto[];

  @ApiProperty({
    description: 'Total number of pages',
    example: 10, // Berikan contoh nilai jika perlu
  })
  totalPages: number;
}

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;
}

export class OrderProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ProductDto })
  product: ProductDto;

  @ApiProperty()
  quantity: number;
}

export class InvoiceDto {
  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  status: string;
}

export class CustomerInvoiceWithProductsDto {
  @ApiProperty()
  customerId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  debt: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ type: () => [InvoiceDto] })
  invoices: InvoiceDto[];

  @ApiProperty({ type: () => [OrderProductDto] })
  purchasedProducts: OrderProductDto[];
}
