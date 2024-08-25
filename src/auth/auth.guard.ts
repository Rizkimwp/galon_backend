import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      console.log('JWT Error:', err);
      console.log('JWT Info:', info);
      throw err || new UnauthorizedException();
    }
    console.log('Validated User:', user);
    return user; // Pastikan untuk mengembalikan objek pengguna yang valid
  }
}
