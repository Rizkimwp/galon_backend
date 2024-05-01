import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CostumerDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  nama: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  nomor_telepon: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  alamat: string;
}
