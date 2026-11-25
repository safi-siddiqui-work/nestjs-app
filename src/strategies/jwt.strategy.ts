import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigType } from '../config/app.config.js';
import { ApiResponseBodyType } from '../types/api-response-body.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<AppConfigType>) {
    super({
      jwtFromRequest: ExtractJwt?.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService?.getOrThrow('JWT_SECRET'),
    });
  }

  validate(
    payload: ApiResponseBodyType['jwtPayload'],
  ): ApiResponseBodyType['jwtPayload'] | null {
    if (!payload) {
      return null;
    }

    // array first itme becomes user, and second becomes authinfo
    // return [];

    return {
      email: payload?.email,
      expiresAt: payload?.expiresAt,
      sessionId: payload?.sessionId && Number(payload?.sessionId),
      userId: payload?.userId && Number(payload?.userId),
      scope: payload?.scope,
    };
  }
}
