// src/orders/orders.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
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
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateOrderDto,
  MonthlyReportDto,
  OrderDto,
  UpdateOrderCustomerProduct,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from 'src/dto/orderDto';

import { OrderService } from 'src/services/order/order.service';
import { Order } from 'src/TypeOrm/entities/order.entity';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enum/role';
import { plainToInstance } from 'class-transformer';
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

  @Get('/monthly-report')
  @ApiOperation({ summary: 'Get monthly report of orders' })
  @ApiResponse({
    status: 200,
    description: 'The monthly order report',
    type: [MonthlyReportDto],
  })
  async getMonthlyReport(): Promise<MonthlyReportDto[]> {
    return this.orderService.getOrdersPerMonth();
  }

  @Get()
  @ApiOperation({ summary: 'Get all order' })
  @ApiResponse({
    status: 200,
    description: 'Return all order.',
    type: [OrderDto],
  })
  async getAllOrder(): Promise<OrderDto[]> {
    const products = await this.orderService.getAllOrders();
    return plainToInstance(OrderDto, products);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get all order' })
  @ApiResponse({
    status: 200,
    description: 'Return all order.',
    type: [OrderDto],
  })
  async getAllOrderToday(): Promise<OrderDto[]> {
    const products = await this.orderService.getAllOrdersToday();
    return plainToInstance(OrderDto, products);
  }

  @Patch('status')
  @ApiOperation({ summary: 'Update Order Status' }) // Ringkasan endpoint
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order, // Tipe dari respon yang dikembalikan
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update order status',
  })
  @ApiBody({ type: UpdateOrderStatusDto }) // Dekorator untuk request body
  async updateOrderStatus(@Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    try {
      const updatedOrder =
        await this.orderService.updateOrderStatus(updateOrderStatusDto);
      return {
        message: 'Order status updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to update order status');
    }
  }

  @Patch('order')
  @ApiOperation({ summary: 'Update Order Status' }) // Ringkasan endpoint
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order, // Tipe dari respon yang dikembalikan
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update order status',
  })
  @ApiBody({ type: UpdateOrderDto }) // Dekorator untuk request body
  async updateOrder(@Body() UpdateOrderDto: UpdateOrderDto) {
    try {
      const updatedOrder =
        await this.orderService.requestDelivery(UpdateOrderDto);
      return {
        message: 'Order status updated successfully',
        data: updatedOrder,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to update order status');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The order has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  async deleteOrder(@Param('id') id: string): Promise<void> {
    try {
      await this.orderService.deleteOrder(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle other types of errors if necessary
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  @Patch(':id/update-customer-product')
  @ApiOperation({
    summary: 'Update Customer dan Produk dalam Pesanan',
    description:
      'Mengupdate customer dan produk dari order tertentu. Jika status order sudah Lunas atau Hutang, order tidak bisa diubah.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID dari order yang akan diperbarui',
  })
  @ApiResponse({
    status: 200,
    description: 'Order berhasil diperbarui',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Order dengan status Lunas atau Hutang tidak bisa diubah',
  })
  @ApiResponse({
    status: 404,
    description: 'Order atau Customer tidak ditemukan',
  })
  async updateCustomerAndProduct(
    @Param('id') orderId: string,
    @Body() updateOrderCustomerProduct: UpdateOrderCustomerProduct,
  ): Promise<Order> {
    // Pastikan id dari parameter URL disamakan dengan DTO
    updateOrderCustomerProduct.orderId = orderId;

    try {
      return await this.orderService.updateCustomerAndProduct(
        updateOrderCustomerProduct,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
