import {
  AuthenticationRegistry,
  JwtBearerProvider,
  JwtClaims,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';

@Injectable()
// export class JwtAuth extends JwtBearerProvider<ApiResponseBodyType['user']> {
export class JwtAuth extends JwtBearerProvider<unknown> {
  constructor(registry: AuthenticationRegistry) {
    super({ realm: 'store' });
    registry?.registerProvider(this);
  }

  protected validate(claims: JwtClaims) {
    return { name: 'Safi', id: claims?.sub, claims };
  }
}
