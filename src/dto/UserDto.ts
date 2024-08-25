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

export class LoginUserDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
