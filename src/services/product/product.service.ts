import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto, UpdateProductDto } from 'src/dto/productDto';
import { Product } from 'src/TypeOrm/entities/product.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    try {
      const productId = uuidv4();

      if (file && file.buffer) {
        const fileName = `${productId}-${file.originalname}`;
        const uploadPath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          fileName,
        ); // Adjust path as needed

        // Ensure directory exists
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        // Save file to filesystem
        fs.writeFileSync(uploadPath, file.buffer);

        createProductDto.photo = fileName;
      } else {
        throw new InternalServerErrorException('File buffer is undefined');
      }

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
}
