import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { CreateCustomerDto } from 'src/dto/customersDto';
import { Role } from 'src/enum/role';
import { CustomersService } from 'src/services/customers/customers.service';
import { Customer } from 'src/TypeOrm/entities/customer.entity';

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

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get()
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
}
