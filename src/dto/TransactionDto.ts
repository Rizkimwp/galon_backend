import { ApiProperty } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiProperty()
  partialAmount: number;
}
