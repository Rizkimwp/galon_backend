import { ApiProperty } from '@nestjs/swagger';

export class CreateContohDto {
  @ApiProperty({ example: 'contoh1', description: 'Contoh Hello World' })
  readonly nama: string;
}
