import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import {
  CreateKeuangan,
  GetSaldo,
  KeuanganResponseDto,
} from 'src/dto/keuangan.dto';
import { Role } from 'src/enum/role';
import { KeuanganService } from 'src/services/keuangan/keuangan.service';

@ApiTags('Keuangan')
@ApiBearerAuth('access-token')
@Controller('keuangan')
export class KeuanganController {
  constructor(private readonly keuanganService: KeuanganService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Post('keuangan')
  @ApiResponse({ status: 200, description: 'Pengeluaran Berhasil Dibuat' })
  @ApiBody({ type: CreateKeuangan })
  async catatKeuangan(@Body() data: CreateKeuangan) {
    const response = await this.keuanganService.catatKeuangan(data);
    return response;
  }

  @Get('keuangan')
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil data keuangan',
    type: KeuanganResponseDto,
  })
  async getKeuangan(): Promise<KeuanganResponseDto> {
    return this.keuanganService.getKeuangan();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.CUSTOMER)
  @Get('saldo')
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 200,
    description: 'Berhasil mengambil data saldo',
    type: GetSaldo,
  })
  async getSaldo(): Promise<GetSaldo> {
    return this.keuanganService.getSaldo();
  }
}
