import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Outbox } from '@nestjs/outbox';
import { type DatabaseType } from '../../databases/drizzle.database.js';
import { type SignUpSchemaType } from './auth.schema.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly passwordHasher: PasswordHasher,
    // private readonly signinService: SignInService,
    private readonly tokenService: TokenService,

    private readonly outbox: Outbox,
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

    // const result = await this?.signinService?.signIn('1', {
    //   method: 'password',
    //   metadata: body,
    // });
    const result = await this?.tokenService?.issue('1', {
      method: 'password',
      claims: {
        amr: ['pwd'],
      },
    });

    // throw new ZodError([
    //   {
    //     code: 'custom',
    //     path: ['email'],
    //     message: 'Email is blah',
    //   },
    // ]);

    return {
      user: { email: body?.email },
      result,
      // result,
    };
  }
}
