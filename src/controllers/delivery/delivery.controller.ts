import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import {
  CreateDeliveryDto,
  DeliveryAdminDto,
  DeliveryDTO,
  DeliveryReportProfitToday,
  SimpleDeliveryDTO,
  UpdateDeliveryStatusDto,
  UpdateDeliveryStatusResponseDto,
} from 'src/dto/deliveryDto';
import { Role } from 'src/enum/role';

import { DeliveryService } from 'src/services/delivery/delivery.service';
import { Delivery } from 'src/TypeOrm/entities/delivery.entity';

@ApiTags('Deliveries')
@ApiBearerAuth('access-token')
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // @UseGuards(JwtAuthGuard)
  // @Roles(Role.COURIER, Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new delivery' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The delivery has been successfully created.',
    type: Delivery,
  })
  @ApiBadRequestResponse({
    description: 'Bad request, possibly invalid input.',
  })
  @ApiBody({
    description: 'Create Delivery DTO',
    type: CreateDeliveryDto,
  })
  async createDelivery(
    @Body() createDeliveryDto: CreateDeliveryDto,
  ): Promise<Delivery> {
    try {
      // Call the service to handle delivery creation
      return await this.deliveryService.createDelivery(createDeliveryDto);
    } catch (error) {
      console.error('Error creating delivery:', error.message);
      throw new InternalServerErrorException('Failed to create delivery');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get('delivery/:customerId')
  @ApiOperation({ summary: 'Get deliveries by Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery details retrieved successfully.',
    type: [SimpleDeliveryDTO], // Menggunakan DTO baru
  })
  @ApiResponse({ status: 404, description: 'Delivery not found.' })
  async getDeliveriesByCustomerId(@Req() req): Promise<SimpleDeliveryDTO[]> {
    const customerId = req.user.id;
    const deliveries =
      await this.deliveryService.getDeliveryByCustomerId(customerId);
    return deliveries;
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get('/today')
  @ApiOperation({ summary: 'Get deliveries by Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery details retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Delivery not found.' })
  async getDeliveryToday(@Req() req): Promise<DeliveryDTO[]> {
    const customerId = req.user.id;
    console.log('userTest', req.user.id);
    const deliveries =
      await this.deliveryService.getDeliveryByCustomerIdToday(customerId);

    const deliveryDTOs = deliveries.map((delivery) => {
      let totalPrice = 0;

      if (delivery.order && delivery.order.orderProducts) {
        delivery.order.orderProducts.forEach((orderProduct) => {
          totalPrice += orderProduct.quantity * orderProduct.product.price;
        });
      }

      return {
        id: delivery.id,
        status: delivery.status,
        totalPrice: totalPrice,
      };
    });

    // Kirimkan update melalui WebSocket

    return deliveryDTOs;
  }

  @Get()
  @ApiOperation({ summary: 'Get all deliveries' }) // Swagger description
  @ApiResponse({
    status: 200,
    description: 'List of all deliveries',
    type: [DeliveryAdminDto], // Using DeliveryDto to describe the response
  })
  async getAllDeliveries(): Promise<DeliveryAdminDto[]> {
    return this.deliveryService.getDeliveryAll();
  }

  @Get('report')
  @ApiOperation({ summary: 'Get delivery report' })
  @ApiQuery({
    name: 'startDate',
    type: String,
    description:
      'Start date for the report in ISO 8601 format (e.g., 2024-01-01T00:00:00Z)',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    description:
      'End date for the report in ISO 8601 format (e.g., 2024-01-31T23:59:59Z)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    schema: {
      example: [
        {
          deliveryId: 'uuid',
          totalProfit: 1500,
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async getDeliveryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.deliveryService.getDeliveryReport(start, end);
  }

  @Get('report/today')
  @ApiOperation({ summary: 'Get delivery report for today' })
  @ApiResponse({
    status: 200,
    description: "Successful response with today's delivery report",
    type: DeliveryReportProfitToday,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async getTodayReport() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const totalProfit = await this.deliveryService.getTotalProfit(start, end);
    return { totalProfit };
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get('total/today')
  @ApiOperation({ summary: 'Get delivery report for today' })
  @ApiResponse({
    status: 200,
    description: "Successful response with today's delivery report",
    type: DeliveryReportProfitToday,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async getToday() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const totalProfit = await this.deliveryService.getTotal(start, end);
    return { totalProfit };
  }

  @Put('/update-status')
  @ApiOperation({ summary: 'Update delivery status and generate invoice' })
  @ApiBody({ type: UpdateDeliveryStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Successful update and invoice generation',
    type: UpdateDeliveryStatusResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDeliveryStatus(
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
  ): Promise<UpdateDeliveryStatusResponseDto> {
    try {
      const invoicePath = await this.deliveryService.updateDelivery(
        updateDeliveryStatusDto,
      );

      if (!invoicePath) {
        throw new InternalServerErrorException('Failed to generate invoice');
      }

      return { invoicePath };
    } catch (error) {
      console.error('Error in updateDeliveryStatus controller:', error.message);
      throw error; // Re-throw the error to be handled by NestJS's global exception filter
    }
  }
}
