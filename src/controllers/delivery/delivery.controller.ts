import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from 'src/services/delivery/delivery.service';

import { Post } from '@nestjs/common';
import { DeliveryDto, DeliveryQueryDto } from 'src/dto/DeliveryDto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Delivery')
@Controller('api/delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Berhasil ditemukan',
  })
  async getAll() {
    return await this.deliveryService.findAll();
  }

  @Get(':kurirId/:tanggal')
  @ApiResponse({
    /* Your API response definition here */
  })
  async getDeliveriesByCourierIdAndDate(@Param() query: DeliveryQueryDto) {
    const { kurirId, tanggal } = query;
    return this.deliveryService.findByKurirAndDate(kurirId, tanggal);
  }

  @Get('/kurirId')
  @ApiQuery({ name: 'kurirId', required: false })
  async getDeliveriesForToday(@Query('kurirId') kurirId: number) {
    try {
      const deliveries =
        await this.deliveryService.findByKurirAndToday(kurirId);
      return plainToInstance(DeliveryDto, deliveries);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch deliveries for today.',
      };
    }
  }

  @Post()
  @ApiBody({ type: DeliveryDto, required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Berhasil Dibuat' })
  async create(@Body(new ValidationPipe()) data: DeliveryDto) {
    try {
      const res = await this.deliveryService.create(data);
      // Jika berhasil, kirim status sukses ke frontend
      return { status: 'success', data: res };
    } catch (error) {
      // Jika terjadi kesalahan, tangkap dan kirim status error ke frontend
      throw new BadRequestException('Permintaan tidak valid');
    }
  }
  @Put(':id')
  @ApiBody({ type: DeliveryDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Berhasil di Update' })
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe())
    data: DeliveryDto,
  ): Promise<{ message: string; status: boolean; data: DeliveryDto }> {
    try {
      const res = await this.deliveryService.update(id, data);
      if (res) {
        return { status: true, message: 'Update Data Delivery Berhasil', data };
      } else {
        throw new Error('Data Gagal Update');
      }
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Data tidak ditemukan');
    }
  }
}
