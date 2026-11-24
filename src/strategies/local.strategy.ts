import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<unknown> {
    // Validate user credentials
    if (true) {
    }

    // return null;
    
    // guard assigns to req.user
    return {
      username,
    };
  }
}
