import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateRewardDto,
  PaginationReward,
  RedeemRewardDto,
  RewardDto,
  UpdateRewardDto,
} from 'src/dto/reward.dto';
import { Customer } from 'src/TypeOrm/entities/customer.entity';
import { Redeem } from 'src/TypeOrm/entities/redeem.entity';
import { Reward } from 'src/TypeOrm/entities/reward.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Redeem)
    private readonly redeemRepository: Repository<Redeem>,
  ) {}

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(createRewardDto);
    reward.id = uuidv4(); // Generate UUID for the reward
    return await this.rewardRepository.save(reward);
  }

  async getPaginateReward(
    page: number,
    limit: number,
  ): Promise<PaginationReward> {
    const [reward, total] = await this.rewardRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    if (total === 0) {
      throw new NotFoundException('Reward not found');
    }

    const totalPages = Math.ceil(total / limit);

    const rewardDtos = reward.map((reward) => {
      const rewardDto = new RewardDto();
      rewardDto.id = reward.id;
      rewardDto.imageUrl = reward.imageUrl;
      rewardDto.name = reward.name;
      rewardDto.pointsRequired = reward.pointsRequired;
      return rewardDto;
    });

    return { reward: rewardDtos, totalPages };
  }

  async findAll(): Promise<Reward[]> {
    return await this.rewardRepository.find();
  }

  async findOne(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({ where: { id } });
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }
    return reward;
  }

  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
    const reward = await this.findOne(id);
    Object.assign(reward, updateRewardDto);
    return await this.rewardRepository.save(reward);
  }

  async remove(id: string): Promise<void> {
    const reward = await this.findOne(id);
    await this.rewardRepository.remove(reward);
  }

  async redeemReward(redeemRewardDto: RedeemRewardDto): Promise<Redeem> {
    const { customerId, rewardId } = redeemRewardDto;

    // Cari customer
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer tidak ditemukan');
    }

    // Cari reward
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward) {
      throw new NotFoundException('Reward tidak ditemukan');
    }

    // Cek apakah customer memiliki poin yang cukup
    if (customer.points < reward.pointsRequired) {
      throw new BadRequestException(
        'Poin tidak cukup untuk menukarkan reward ini',
      );
    }

    // Kurangi poin customer sesuai dengan pointsRequired dari reward
    customer.points -= reward.pointsRequired;
    await this.customerRepository.save(customer);

    // Simpan data redeem
    const redeem = this.redeemRepository.create({
      id: uuidv4(),
      customer,
      reward,
      pointsUsed: reward.pointsRequired,
      redeemedAt: new Date(),
    });

    return this.redeemRepository.save(redeem);
  }
}
