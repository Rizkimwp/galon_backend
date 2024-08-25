// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/TypeOrm/entities/user.entity';
import { JwtPayload } from 'src/auth/jwt-payload';
import { Role } from 'src/enum/role';

import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null; // Return null jika pengguna tidak ditemukan atau password tidak cocok
  }

  async login(user: User) {
    const payload: JwtPayload = {
      username: user.username,
      role: user.role,
      id: user.id,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, role: Role): Promise<User | null> {
    const user = await this.usersService.findOneByUsernameAndRole(
      username,
      role,
    );

    if (user) {
      return user; // Mengembalikan objek pengguna jika ditemukan
    }

    return null; // Mengembalikan null jika pengguna tidak ditemukan atau tidak sesuai rolenya
  }
}
