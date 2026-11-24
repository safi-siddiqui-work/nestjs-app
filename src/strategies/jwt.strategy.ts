import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigType } from '../config/app.config.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<AppConfigType>) {
    super({
      jwtFromRequest: ExtractJwt?.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService?.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload?.sub,
      email: payload?.email,
    };
  }
}
