import { Role } from 'src/enum/role';

export interface JwtPayload {
  username: string;
  role: Role;
  id: string;
}
