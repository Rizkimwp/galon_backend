import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import {
  CreateDeliveryDto,
  DeliveryDTO,
  SimpleDeliveryDTO,
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
  @Get()
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

    return deliveries.map((delivery) => {
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
  }
}
