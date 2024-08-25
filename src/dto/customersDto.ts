import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

export class CustomerDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  address: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  email?: string;
}
export class OrderCustomerDto {
  @ApiProperty()
  id: number;
}
