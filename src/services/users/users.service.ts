// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/TypeOrm/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserDto } from 'src/dto/UserDto';
import { Role } from 'src/enum/role';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.id = uuidv4();
    user.username = createUserDto.username;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    user.role = createUserDto.role;
    user.name = createUserDto.name;
    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Update the fields only if they are present in the updateUserDto
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    return this.userRepository.save(user);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
  async findOneByUsernameAndRole(
    username: string,
    role: Role,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { username: username, role: role },
    });
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();

    // Konversi entitas ke DTO tanpa properti password
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Exclude password
      return plainToInstance(UserDto, result);
    });
  }
}
