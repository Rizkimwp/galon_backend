import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CourierSalarySlipDTO } from 'src/dto/earningDto';
import { EarningService } from 'src/services/earning/earning.service';
import { Response } from 'express';
@ApiTags('Courier Earnings')
@ApiBearerAuth('access-token')
@Controller('earning')
export class EarningController {
  constructor(private readonly earningService: EarningService) {}
  @ApiOperation({
    summary:
      'Get salary slip for a courier by courierId for a specific date or today',
  }) // Deskripsi singkat endpoint
  @ApiParam({ name: 'courierId', description: 'ID of the courier' }) // Param untuk Swagger
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date for the salary slip (optional). Defaults to today.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Salary slip for the courier with details of deliveries and products.',
    type: CourierSalarySlipDTO, // Response type DTO
  })
  @ApiResponse({
    status: 404,
    description: 'Courier not found or no earnings found for the courier.',
  })
  @Get('salary-slip-today/:courierId')
  async getCourierSalarySlipToday(
    @Param('courierId') courierId: string,
    @Query('date') date?: string,
  ): Promise<CourierSalarySlipDTO> {
    let salaryDate: Date;

    if (date) {
      salaryDate = new Date(date);
      // Ensure that the date provided is valid
      if (isNaN(salaryDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    } else {
      salaryDate = new Date();
      salaryDate.setHours(0, 0, 0, 0); // Set to the start of today
    }

    // Call the service to get the salary slip for the specified or today's date
    return await this.earningService.getCourierSalarySlip({
      courierId,
      date: salaryDate, // Pass the date to the service
    });
  }

  @ApiOperation({
    summary: 'Get salary slip for a courier by courierId and date',
  })
  @ApiParam({ name: 'courierId', description: 'ID of the courier' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date for the salary slip (optional). Defaults to today.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Salary slip for the courier with details of deliveries and products in PDF format.',
  })
  @ApiResponse({
    status: 404,
    description: 'Courier not found or no earnings found for the courier.',
  })
  @Get('salary-download/:courierId')
  async getCourierSalaryByDate(
    @Param('courierId') courierId: string,
    @Query('date') date: string,
    @Res() res: Response,
  ): Promise<void> {
    // If date is provided, parse it; otherwise, use today's date

    try {
      const salarySlipData = await this.earningService.getCourierSalarySlip({
        date: new Date(date),
        courierId,
      });

      const pdfBuffer =
        await this.earningService.generateSalarySlipPdf(salarySlipData);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="slip-gaji.pdf"',
        'Content-Length': pdfBuffer.length,
      });

      // Send the PDF as a response
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Error generating or sending PDF:', error);
      res.status(500).send('Failed to generate PDF');
    }
  }

  private extractCourierSalarySlip(response): CourierSalarySlipDTO {
    const courierName = response.courierName;
    const tanggal = response.createAt;
    const totalEarnings = response.totalEarnings;
    const details = response.details.map((detail) => {
      const deliveryAmount = detail.amount;
      const products = detail.products.map((product) => {
        return {
          productName: product.productName,
          quantity: product.quantity,
          price: product.price,
        };
      });

      return {
        deliveryId: detail.deliveryId,
        deliveryAmount,
        products,
      };
    });

    // Return a structured response DTO
    return {
      tanggal,
      courierName, // Nama kurir
      totalEarnings,
      details,
    };
  }
}
