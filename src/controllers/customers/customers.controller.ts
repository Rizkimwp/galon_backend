import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CostumerDto } from 'src/dto/CustomerDto';
import { CustomersService } from 'src/services/customers/customers.service';
import { Customers } from 'src/TypeOrm/entities/customers.entity';

@ApiTags('customers')
@Controller('/api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomersService) {}

  @Get()
  async findAll() {
    try {
      const customers = await this.customerService.findAll();
      console.log('All customers retrieved successfully');
      return plainToInstance(Customers, customers); // Mengembalikan data pelanggan langsung dari handler permintaan
    } catch (error) {
      console.error('Error while fetching customers', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a customer by ID' })
  async findOne(@Param('id') id: number): Promise<Customers> {
    return await this.customerService.findOne(id);
  }

  @Post()
  @ApiBody({ type: Customers })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: Customers,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() customerData: Partial<Customers>,
  ): Promise<Customers | { message: string }> {
    try {
      const customer = await this.customerService.create(customerData);
      return customer;
    } catch (error) {
      return { message: 'Failed to create customer' };
    }
  }

  @Put(':id')
  @ApiBody({ type: Customers })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update a customer by ID',
    type: Customers,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Data gagal Diperbarui',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Data tidak Ditemukan',
  })
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) data: CostumerDto,
  ): Promise<{ data: CostumerDto; message: string }> {
    try {
      const res = await this.customerService.update(id, data);
      if (res) {
        return {
          message: 'Berhasil Diupdate',
          data,
        };
      } else {
        throw new Error('Data tidak berhasil di update');
      }
    } catch (error) {
      throw new NotFoundException('Data tidak ditemukan');
    }
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete a customer by ID' })
  async remove(
    @Param('id') id: number,
  ): Promise<{ status: boolean; message: string }> {
    try {
      const res = await this.customerService.remove(id);
      if (res) {
        return { status: true, message: 'Data berhasil dihapus' };
      } else {
        throw new Error('Data tidak berhasil dihapus');
      }
    } catch (error) {
      throw new NotFoundException('Data tidak ditemukan');
    }
  }
}
