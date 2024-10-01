import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({ example: 'Reward Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  pointsRequired: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
export class RewardDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Reward Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsInt()
  pointsRequired: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateRewardDto {
  @ApiProperty({ example: 'Reward Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsInt()
  pointsRequired?: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class PaginationReward {
  @ApiProperty({
    description: 'List of customers',
    type: [RewardDto],
  })
  reward: RewardDto[];

  @ApiProperty({
    description: 'Total number of pages',
    example: 10, // Berikan contoh nilai jika perlu
  })
  totalPages: number;
}

export class RedeemRewardDto {
  @IsUUID()
  @ApiProperty()
  @IsNotEmpty()
  customerId: string; // ID customer yang menukarkan reward

  @IsUUID()
  @ApiProperty()
  @IsNotEmpty()
  rewardId: string; // ID reward yang ingin ditukarkan
}
