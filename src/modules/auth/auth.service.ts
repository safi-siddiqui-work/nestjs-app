import { PasswordHasher } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { JwtService } from '@nestjs/jwt';
import { Outbox } from '@nestjs/outbox';
import { type DatabaseType } from '../../databases/drizzle.database.js';
import { type SignUpSchemaType } from './auth.schema.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly passwordHasher: PasswordHasher,
    private readonly outbox: Outbox,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: SignUpSchemaType) {
    const hashed = await this?.passwordHasher?.hash(body?.password);

    const result = await this?.db?.transaction(async (tx) => {
      // insert something

      await this?.outbox?.add(tx, [
        {
          topic: 'email-auth.sent',
          payload: { user: { email: body?.email, name: 'Safi' } },
        },
      ]);
    });

    this?.outbox?.notify();

    return {
      user: { email: body?.email },
    };
  }

  async signin(body: SignUpSchemaType) {
    const hashed = await this?.passwordHasher?.hash(body?.password);

    const check = await this?.passwordHasher?.verify(body?.password, hashed);

    if (this?.passwordHasher?.needsRehash(hashed)) {
      // upgrade old hashed passwords
    }

    const tokens = this?.jwtService?.sign(
      {
        sub: 1,
        email: body?.email,
      },
      {
        expiresIn: '1m',
      },
    );

    // throw new ZodError([
    //   {
    //     code: 'custom',
    //     path: ['email'],
    //     message: 'Email is blah',
    //   },
    // ]);

    return {
      tokens,
      user: { email: body?.email },
    };
  }
}
