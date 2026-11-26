import { SessionType, UserType } from '../databases/drizzle.database.js';

export type ApiResponseBodyType = {
  user?: Partial<UserType>;
  session?: SessionExtendedType;
  jwtPayload?: JwtPayloadType;
};

type JwtPayloadType = {
  // sub?: string;
  sessionId?: number;
  userId?: number;
  email?: string;
  // scope?: string;
  scope?: SessionScopeType;
  expiresAt?: Date;
};

export type SessionScopeType =
  'EMAIL_REGISTRATION_VERIFY' | 'EMAIL_REGISTRATION_CREATE';

type SessionExtendedType = Partial<SessionType> & {
  scope?: SessionScopeType;
};
