// src/types/express.d.ts
import { User } from 'src/TypeOrm/entities/user.entity';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
