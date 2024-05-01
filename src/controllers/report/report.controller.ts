import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportService } from 'src/services/report/report.service';

@ApiTags('Report')
@Controller('/api/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('laporan-pendapatan')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Berhasil ditemukan',
  })
  async getTotalPriceWithQty() {
    try {
      const res = await this.reportService.calculateTotalPrice();
      return { message: 'success', data: res };
    } catch (error) {
      console.error(error);
    }
  }

  @Get('total-price-by-date')
  async getTotalPriceByDate(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<number> {
    return await this.reportService.calculateTotalPriceByDate(
      startDate,
      endDate,
    );
  }

  @Get('total-price-per-year')
  async getTotalPricePerYear(@Query('year') year: number): Promise<number> {
    return await this.reportService.calculateTotalPricePerYear(year);
  }

  @Get('total-price-per-month')
  async getTotalPricePerMonth(
    @Query('year') year: number,
    @Query('month') month: number,
  ): Promise<number> {
    return await this.reportService.calculateTotalPricePerMonth(year, month);
  }

  @Get('total-price-per-day')
  async getTotalPricePerDay(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('day') day: number,
  ): Promise<number> {
    return await this.reportService.calculateTotalPricePerDay(year, month, day);
  }
}
