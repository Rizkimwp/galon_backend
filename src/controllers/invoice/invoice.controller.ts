import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoiceService } from 'src/services/invoice/invoice.service';
import { Response } from 'express';
import { InvoiceWithDebtDto } from 'src/dto/invoiceDto';
@ApiTags('Invoice')
@ApiBearerAuth('access-token')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('generate')
  async generateInvoice(
    @Query('deliveryIds') deliveryIds: string[],
    @Res() res: Response, // Gunakan response dari express
  ): Promise<void> {
    try {
      const pdfBuffer =
        await this.invoiceService.generateInvoiceDelivery(deliveryIds);

      // Kirim buffer PDF sebagai file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());

      res.end(pdfBuffer); // Kirim PDF buffer sebagai respons
    } catch (error) {
      console.error('Error in generateInvoice controller:', error.message);
      throw new InternalServerErrorException('Failed to generate invoice');
    }
  }

  @Get('piutang')
  @ApiResponse({
    status: 200,
    description: 'List of invoices with customer debts',
    type: [InvoiceWithDebtDto], // Menggunakan DTO untuk dokumentasi swagger
  })
  async getInvoicesWithDebt(): Promise<InvoiceWithDebtDto[]> {
    return this.invoiceService.getInvoicesWithDebt();
  }
}
