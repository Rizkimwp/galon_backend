import { Controller, Post, Body } from '@nestjs/common';

import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { CreateUserDto } from 'src/dto/UserDto';
import { UsersService } from 'src/services/users/users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
