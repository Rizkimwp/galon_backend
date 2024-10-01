import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  CreateProductDto,
  GetProduct,
  PhotoProduct,
  SalesReportDto,
  UpdateProductDto,
  UrlPhoto,
} from 'src/dto/productDto';
import { FileService } from 'src/services/file/file.service';
import { ProductService } from 'src/services/product/product.service';
import { Product } from 'src/TypeOrm/entities/product.entity';
@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiBody({
    description: 'Product data with photo',
    type: CreateProductDto,
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Return all products.',
    type: [GetProduct],
  })
  async getAllProducts(): Promise<GetProduct[]> {
    const products = await this.productService.getAllProducts();
    return plainToInstance(GetProduct, products);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProductById(@Param('id') id: string): Promise<Product> {
    return await this.productService.getProductById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated.',
  })
  @ApiBody({
    description: 'Product data with photo',
    type: UpdateProductDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async deleteProduct(@Param('id') id: number): Promise<void> {
    await this.productService.deleteProduct(id);
  }

  @Post('upload/foto')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with photo',
    type: PhotoProduct,
  })
  @ApiResponse({
    status: 200,
    description: 'Return URL',
    type: UrlPhoto,
  })
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UrlPhoto> {
    console.log(file);
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const filePath = await this.fileService.saveFile(file);
    return { url: filePath };
  }

  @Get('sales/report')
  @ApiResponse({
    status: 200,
    description: 'Sales report fetched successfully.',
    type: [SalesReportDto],
  })
  async getSalesReport(): Promise<SalesReportDto[]> {
    return this.productService.getMonthlySalesReport();
  }
}
