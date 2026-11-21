import {
  AuthenticationRegistry,
  SessionCookieProvider,
  SessionRecord,
} from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { ApiResponseBodyType } from '../types/api-response.type.js';

@Injectable()
export class SessionAuthProvider extends SessionCookieProvider<
  ApiResponseBodyType['user']
> {
  constructor(registry: AuthenticationRegistry) {
    super();
    registry?.registerProvider(this);
  }

  validate(session: SessionRecord) {
    return { session, name: 'Safi' };
  }
}
