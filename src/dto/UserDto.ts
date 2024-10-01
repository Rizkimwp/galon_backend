import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from 'src/enum/role';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  name: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  password: string;

  @IsEnum(Role)
  @ApiProperty({ example: Role.CUSTOMER, description: 'Role of the user' })
  role: Role;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  username?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  name?: string;

  @IsEnum(Role)
  @ApiProperty({ example: Role.CUSTOMER, description: 'Role of the user' })
  role?: Role;
}

export class LoginUserDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

export class LoginResponse {
  @ApiProperty()
  token: string;
}

export class UserDto {
  @ApiProperty({
    example: 'uuid-v4-string',
    description: 'The unique identifier for the user',
  })
  id: string;

  @ApiProperty({ example: 'john_doe', description: 'The username of the user' })
  username: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name: string;

  @ApiProperty({
    example: 'admin',
    enum: Role,
    description: 'The role of the user',
  })
  role: Role;
}
