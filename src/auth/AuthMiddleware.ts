import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/services/users/users.service';
// Adjust the import based on your project structure

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, '1Qweerw23215EqwesdweFggsw32as'); // Replace 'your_secret_key' with your actual secret key
        const userId = (decoded as any).id;

        // Fetch user from database or cache
        const user = await this.userService.findById(userId);
        req.user = user;
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
    next();
  }
}
