import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/services/auth/auth.service';
import { JwtPayload } from './jwt-payload';
import { Role } from 'src/enum/role';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('payload jwtstrategy', payload);
    const role: Role = payload.role as Role;

    const user = await this.authService.validateUser(payload.username, role);
    console.log('JWT Strategy', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // Pastikan untuk mengembalikan objek pengguna yang valid
  }
}
