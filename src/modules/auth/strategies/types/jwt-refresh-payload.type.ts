import { Session } from 'src/modules/sessions/entities/session.entity';

export type JwtRefreshPayloadType = {
  sessionID: Session['id'];
  iat: number;
  exp: number;
};
