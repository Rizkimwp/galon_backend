// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dto/orderDto';

import { OrderService } from 'src/services/order/order.service';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role';
@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The order has been successfully created.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer or product not found.',
  })
  @ApiBody({
    description: 'Create Order DTO',
    type: CreateOrderDto,
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    const id = req.user?.id; // Access user from request

    if (!id) {
      throw new Error('User not authenticated');
    }
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all orders for a customer' })
  @ApiResponse({ status: 200, description: 'List of orders for the customer.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async getOrdersByCustomer(@Param('customerId') customerId: string) {
    return await this.orderService.getOrdersByCustomer(customerId);
  }
}
