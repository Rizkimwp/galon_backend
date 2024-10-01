import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';

import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateUserDto, UpdateUserDto, UserDto } from 'src/dto/UserDto';
import { UsersService } from 'src/services/users/users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all users' }) // Ringkasan dari API
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: [UserDto],
  })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }
}
