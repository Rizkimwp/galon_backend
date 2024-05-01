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
import { Courier } from 'src/TypeOrm/entities/courier.entity';
import { CourierDto } from 'src/dto/CourierDto';
import { CourierService } from 'src/services/courier/courier.service';

@ApiTags('courier')
@Controller('api/courier')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Berhasil Mengambil Data Kurir' })
  async findAll(): Promise<CourierDto[]> {
    const data = await this.courierService.findAll();
    return plainToInstance(CourierDto, data);
  }

  @Post()
  @ApiBody({ type: CourierDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Courier Created Successfully',
    type: Courier,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  async create(
    @Body(new ValidationPipe()) createCourierDto: CourierDto,
  ): Promise<CourierDto | { message: string }> {
    try {
      const courier = await this.courierService.create(createCourierDto);
      return plainToInstance(CourierDto, courier);
    } catch (error) {
      return { message: 'Data Gagal Dibuat' };
    }
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Berhasil mengambil data kurir',
    type: Courier,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Data tidak ditemukan',
  })
  async findOne(@Param('id') id: number): Promise<CourierDto | undefined> {
    const courier = await this.courierService.findOne(id);
    if (!courier) {
      throw new NotFoundException('Courier Not Found'); // Menggunakan NotFoundException
    }
    return plainToInstance(CourierDto, courier);
  }

  @Put(':id')
  @ApiBody({ type: CourierDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Berhasil Diperbarui',
    type: Courier,
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
    @Body(new ValidationPipe()) data: CourierDto,
  ): Promise<{ message: string; data: CourierDto }> {
    try {
      const res = await this.courierService.update(id, data);
      if (res) {
        return { message: 'Data Berhasil Di Upadate', data };
      } else {
        throw new Error('Data Tidak berhasil di update');
      }
    } catch (error) {
      throw new NotFoundException('Data tidak ditemukan');
    }
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Courier Berhasil Dihapus',
  })
  async remove(
    @Param('id') id: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deleteResult = await this.courierService.delete(id);
      if (deleteResult.affected === 1) {
        return { success: true, message: 'Courier Berhasil Dihapus' };
      } else {
        throw new NotFoundException('Courier tidak ditemukan');
      }
    } catch (error) {
      throw new NotFoundException('Courier tidak ditemukan gagal dihapus');
    }
  }
}
