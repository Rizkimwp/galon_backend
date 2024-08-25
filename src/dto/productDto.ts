import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ description: 'Name of the product', example: 'Water Gallon' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Photo of the product',
    type: 'string',
    format: 'binary',
    required: false,
  })
  photo: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Price of the product', example: 5.99 })
  price: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Stock quantity of the product', example: 100 })
  stock: number;

  @IsString()
  @ApiProperty({
    description: 'Description of the product',
    example: 'High-quality water gallon',
  })
  description: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Name of the product',
    example: 'Water Gallon',
    required: false,
  })
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'Price of the product',
    example: 5.99,
    required: false,
  })
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({
    description: 'Stock quantity of the product',
    example: 100,
    required: false,
  })
  stock?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Description of the product',
    example: 'High-quality water gallon',
    required: false,
  })
  description?: string;
}

export class Product {
  @ApiProperty({})
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The quantity of the product in the order',
    example: 2,
  })
  @IsNumber()
  quantity: number;
}

export class GetProduct {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '1',
  })
  @Expose()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Water Gallon',
  })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Price of the product',
    example: 5.99,
  })
  @Expose()
  @IsDecimal()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Stock quantity of the product',
    example: 100,
  })
  @Expose()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Rating of the product (1 to 5 stars)',
    example: 4.5,
  })
  @Expose()
  @IsDecimal()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Indicates if the product is a best seller',
    example: true,
  })
  @Expose()
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;
}
