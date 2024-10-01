import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateProductDto,
  SalesReportDto,
  UpdateProductDto,
} from 'src/dto/productDto';
import { OrderProduct } from 'src/TypeOrm/entities/orderproduct.entity';
import { Product } from 'src/TypeOrm/entities/product.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const productId = uuidv4();
      const product = this.productRepository.create({
        ...createProductDto,
        id: productId,
      });

      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async getMonthlySalesReport(): Promise<SalesReportDto[]> {
    // Mengambil data berdasarkan bulan dengan QueryBuilder
    const orderProducts = await this.orderProductRepository
      .createQueryBuilder('orderProduct')
      .leftJoinAndSelect('orderProduct.product', 'product') // Bergabung dengan tabel product
      .select('orderProduct.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderProduct.quantity)', 'totalQuantity')
      .addSelect('MONTH(orderProduct.createdAt)', 'month')
      .groupBy('orderProduct.productId')
      .addGroupBy('MONTH(orderProduct.createdAt)')
      .addGroupBy('product.name')
      .getRawMany();

    const salesReport: SalesReportDto[] = [];

    for (const orderProduct of orderProducts) {
      salesReport.push({
        productId: orderProduct.productId,
        productName: orderProduct.productName,
        totalQuantity: parseInt(orderProduct.totalQuantity, 10), // Total kuantitas per bulan
        totalSales: orderProduct.totalQuantity * orderProduct.productPrice, // Menghitung total penjualan per bulan
        month: orderProduct.month, // Bulan dari penjualan
      });
    }

    return salesReport;
  }
}
