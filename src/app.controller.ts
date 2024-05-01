import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateContohDto } from './dto/contoh.dto';

@ApiTags('contoh')
@Controller('contoh')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Menampilkan Pesan Hello World' })
  async getHello(): Promise<string> {
    const hello = await this.appService.getHello();
    return hello;
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Contoh Berhasil Dibuat' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addContoh(@Body() createContohDto: CreateContohDto): string {
    return 'Contoh Berhasil Dibuat';
  }
}
