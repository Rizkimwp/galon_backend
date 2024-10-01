import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreatePaymentDto, PayDebtDto } from 'src/dto/paymentDto';
import { PaymentService } from 'src/services/payment/payment.service';
import { Payment } from 'src/TypeOrm/entities/payment.entity';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment for an invoice' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get(':invoiceId')
  @ApiOperation({ summary: 'Get all payments for a specific invoice' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
    type: [Payment],
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getPaymentsByInvoice(
    @Param('invoiceId') invoiceId: string,
  ): Promise<Payment[]> {
    const payments = await this.paymentService.getPaymentsByInvoice(invoiceId);
    if (!payments || payments.length === 0) {
      throw new NotFoundException(
        `No payments found for invoice with ID ${invoiceId}`,
      );
    }
    return payments;
  }

  @Post('pay-debt')
  @ApiOperation({ summary: 'Bayar hutang customer secara parsial' })
  async payDebt(@Body() payDebtDto: PayDebtDto): Promise<any> {
    const { customerId, amount } = payDebtDto;
    return await this.paymentService.payDebt(customerId, amount);
  }
}
