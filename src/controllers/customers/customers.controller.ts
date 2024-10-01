import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import {
  CreateCustomerDto,
  CreateCustomerResponseDto,
  CreateOpsiCustomerDto,
  CustomerInvoiceWithProductsDto,
  PaginationCustomer,
  UpdateCustomerDto,
} from 'src/dto/customersDto';
import { Role } from 'src/enum/role';
import { CustomersService } from 'src/services/customers/customers.service';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { CustomerDto } from '../../dto/customersDto';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
@Controller('customers')
@ApiBearerAuth('access-token')
@ApiTags('customer')
export class CustomersController {
  constructor(private readonly customerService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register Untuk Customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: CreateCustomerDto })
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.createCustomer(createCustomerDto);
  }

  @Post('opsi')
  @ApiOperation({ summary: 'Register Untuk Customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: CreateCustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: CreateOpsiCustomerDto })
  async createOpsiCustomer(
    @Body() createCustomerDto: CreateOpsiCustomerDto,
  ): Promise<CreateCustomerResponseDto> {
    return this.customerService.createOpsiCustomer(createCustomerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get Untuk Customer Berdasarkan Id' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getCustomerById(@Req() req): Promise<Customer> {
    const customerId = req.user.id;
    return this.customerService.getCustomerById(customerId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.CUSTOMER)
  @Get('customer')
  @ApiOperation({ summary: 'Get Untuk Customer Berdasarkan Id' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: [CustomerDto],
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getAll(): Promise<CustomerDto[]> {
    const customer = await this.customerService.getCustomerAll();
    return plainToInstance(CustomerDto, customer);
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Get Customers with Pagination' })
  @ApiResponse({
    status: 200,
    description: 'The customers have been successfully fetched.',
    type: PaginationCustomer,
  })
  @ApiResponse({ status: 404, description: 'Customers not found.' })
  async getPaginate(
    @Query('page') page: number = 1, // Default to page 1 if not provided
    @Query('limit') limit: number = 10, // Default to limit 10 if not provided
  ): Promise<PaginationCustomer> {
    try {
      const { customers, totalPages } =
        await this.customerService.getPaginatedCustomers(page, limit);
      return { customers, totalPages };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new NotFoundException('Customers not found');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer data' })
  @ApiResponse({
    status: 200,
    description: 'Customer data updated successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Get('debt')
  @ApiOperation({ summary: 'Get all customers with debt' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [CustomerInvoiceWithProductsDto],
  })
  @ApiResponse({ status: 404, description: 'No customers with debt found' })
  async getCustomersWithDebt(): Promise<CustomerInvoiceWithProductsDto[]> {
    return this.customerService.getCustomersWithDebt();
  }

  @Get('cetakDebt')
  @ApiOperation({ summary: 'Cetak Hutang Berdasarkan Id Customer' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [Customer],
  })
  async cetakDebtByCustomer(
    @Query('id') customerId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer =
        await this.customerService.cetakPiutangByCustomer(customerId);

      // Kirim buffer PDF sebagai file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      res.end(pdfBuffer); // Kirim PDF buffer sebagai respons
    } catch (error) {
      console.error('Error in generateInvoice controller:', error.message);
      throw new InternalServerErrorException('Failed to generate invoice');
    }
  }
}
