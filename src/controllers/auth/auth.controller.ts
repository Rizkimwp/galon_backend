// src/auth/auth.controller.ts

import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from 'src/services/auth/auth.service';

import { CreateUserDto, LoginUserDto } from 'src/dto/UserDto';
import { UsersService } from 'src/services/users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ description: 'User login credentials', type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginUserDto) {
    const { username, password } = loginDto;
    const user = await this.authService.validate(username);

    if (!user) {
      console.log(username, password);
      throw new NotFoundException('username atau password salah');
    }

    return this.authService.login(user);
  }
}
