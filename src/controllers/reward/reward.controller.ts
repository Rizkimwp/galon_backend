import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateRewardDto,
  PaginationReward,
  RedeemRewardDto,
  UpdateRewardDto,
} from 'src/dto/reward.dto';
import { RewardService } from 'src/services/reward/reward.service';
import { Redeem } from 'src/TypeOrm/entities/redeem.entity';
import { Reward } from 'src/TypeOrm/entities/reward.entity';

@ApiTags('rewards')
@ApiBearerAuth('access-token')
@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reward' })
  @ApiResponse({
    status: 201,
    description: 'The reward has been successfully created.',
    type: Reward,
  })
  create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardService.create(createRewardDto);
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Get Customers with Pagination' })
  @ApiResponse({
    status: 200,
    description: 'The customers have been successfully fetched.',
    type: PaginationReward,
  })
  @ApiResponse({ status: 404, description: 'Customers not found.' })
  async getPaginate(
    @Query('page') page: number = 1, // Default to page 1 if not provided
    @Query('limit') limit: number = 10, // Default to limit 10 if not provided
  ): Promise<PaginationReward> {
    try {
      const { reward, totalPages } = await this.rewardService.getPaginateReward(
        page,
        limit,
      );
      return { reward, totalPages };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new NotFoundException('Customers not found');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all rewards' })
  @ApiResponse({
    status: 200,
    description: 'List of all rewards',
    type: [Reward],
  })
  findAll(): Promise<Reward[]> {
    return this.rewardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reward by ID' })
  @ApiResponse({
    status: 200,
    description: 'The reward with the given ID',
    type: Reward,
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  findOne(@Param('id') id: string): Promise<Reward> {
    return this.rewardService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a reward by ID' })
  @ApiResponse({
    status: 200,
    description: 'The reward has been successfully updated.',
    type: Reward,
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  update(
    @Param('id') id: string,
    @Body() updateRewardDto: UpdateRewardDto,
  ): Promise<Reward> {
    return this.rewardService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reward by ID' })
  @ApiResponse({
    status: 204,
    description: 'The reward has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Reward not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.rewardService.remove(id);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem reward untuk customer' })
  @ApiResponse({
    status: 201,
    description: 'Reward berhasil ditukarkan.',
    type: Redeem,
  })
  @ApiResponse({
    status: 400,
    description: 'Customer tidak memiliki poin yang cukup.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer atau Reward tidak ditemukan.',
  })
  async redeemReward(
    @Body() redeemRewardDto: RedeemRewardDto,
  ): Promise<Redeem> {
    return this.rewardService.redeemReward(redeemRewardDto);
  }
}
