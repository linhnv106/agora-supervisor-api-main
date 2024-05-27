import { Session } from 'src/modules/sessions/entities/session.entity';
import { User } from 'src/modules/users/entities/user.entity';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  sessionID: Session['id'];
  iat: number;
  exp: number;
};
