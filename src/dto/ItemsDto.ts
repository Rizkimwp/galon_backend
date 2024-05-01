import { ApiProperty } from '@nestjs/swagger';

export class ItemsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  namaBarang: string;

  @ApiProperty()
  stok: number;

  @ApiProperty()
  harga: number;
}
