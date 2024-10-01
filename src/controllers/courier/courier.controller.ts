import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CourierDto,
  CreateCourierDto,
  UpdateCourierDto,
} from 'src/dto/courierDto';
import { CourierService } from 'src/services/courier/courier.service';
import { Courier } from 'src/TypeOrm/entities/courier.entity';
@ApiTags('Couriers') // Menambahkan Swagger tag untuk API Couriers
@ApiBearerAuth('access-token')
@Controller('couriers')
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all couriers',
    type: [CourierDto],
  })
  async findAll(): Promise<CourierDto[]> {
    return this.courierService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new courier' })
  @ApiResponse({
    status: 201,
    description: 'Courier created successfully',
    type: Courier,
  })
  @ApiBody({ type: CreateCourierDto })
  async create(@Body() createCourierDto: CreateCourierDto): Promise<Courier> {
    return this.courierService.create(createCourierDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing courier' })
  @ApiResponse({
    status: 200,
    description: 'Courier updated successfully',
    type: Courier,
  })
  @ApiBody({ type: UpdateCourierDto })
  async update(
    @Param('id') id: string,
    @Body() updateCourierDto: UpdateCourierDto,
  ): Promise<Courier> {
    return this.courierService.update(id, updateCourierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a courier' })
  @ApiResponse({ status: 200, description: 'Courier deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.courierService.delete(id);
  }
}
