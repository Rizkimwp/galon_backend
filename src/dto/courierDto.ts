import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CourierDto {
  @ApiProperty({ example: 'ae3452f3-12d6-4567-b78e-78c5eaa5f123' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '+6281295489405' })
  phoneNumber: string;
}

export class CreateCourierDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the courier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    example: '+6281234567890',
    description: 'Phone number of the courier',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phoneNumber: string;
}

export class UpdateCourierDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the courier' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({
    example: '+6281234567890',
    description: 'Phone number of the courier',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phoneNumber: string;
}
