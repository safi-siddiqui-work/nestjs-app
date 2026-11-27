import { SessionType, UserType } from '../databases/drizzle.database.js';
import { Nullable } from './api-response.type.js';

export type ApiResponseBodyType = {
  user?: Partial<UserType>;
  session?: SessionExtendedType;
  jwtPayload?: JwtPayloadType;
  outbox?: OutboxType;
};

type JwtPayloadType = {
  // sub?: string;
  sessionId?: number;
  userId?: Nullable<number>;
  email?: string;
  // scope?: string;
  scope?: SessionScopeType;
  expiresAt?: Date;
  token?: string;
};

export type SessionScopeType =
  'USER_LOGIN' | 'EMAIL_REGISTRATION_VERIFY' | 'EMAIL_REGISTRATION_CREATE';

type SessionExtendedType = Partial<SessionType> & {
  scope?: SessionScopeType;
  extraExpiryMinutes?: number;
  extraExpiryDays?: number;
  extraCode?: string;
  extraAccessToken?: string;
};

type OutboxType = {
  topic?: string;
};
