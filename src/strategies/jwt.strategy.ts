import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigType } from '../config/app.config.js';
import { ApiResponseBodyType } from '../types/api-response.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<AppConfigType>) {
    super({
      jwtFromRequest: ExtractJwt?.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService?.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(
    payload: ApiResponseBodyType['jwtPayload'],
  ): Promise<ApiResponseBodyType['jwtPayload'] | null> {
    if (!payload || !payload?.sub || !payload?.email) {
      return null;
    }

    // array first itme becomes user, and second becomes authinfo
    // return [];

    return {
      sub: payload?.sub,
      email: payload?.email,
    };
  }
}
