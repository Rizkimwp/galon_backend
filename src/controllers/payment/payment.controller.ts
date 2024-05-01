import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionDto } from 'src/dto/TransactionDto';
import { PaymentService } from 'src/services/payment/payment.service';

@ApiTags('Payment')
@Controller('api/payment')
export class PaymentController {
  constructor(private readonly transaksiService: PaymentService) {}

  @Get()
  async getAll(): Promise<TransactionDto[]> {
    return await this.transaksiService.findAll();
  }

  @Post()
  @ApiBody({ type: TransactionDto })
  @ApiResponse({ status: 201, description: 'Created Successfully' })
  async create(
    @Body() data: TransactionDto,
  ): Promise<{ message: string; data: TransactionDto }> {
    try {
      const payment = await this.transaksiService.create(data);
      if (payment) {
        return { message: 'berhasil ditambahkan', data };
      }
    } catch (error) {
      throw new NotFoundException('Gagal Menyambung ke server');
    }
  }
}
