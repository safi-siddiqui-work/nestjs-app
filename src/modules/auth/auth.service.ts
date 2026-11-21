import { PasswordHasher, SignInService } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { type DatabaseType } from '../../database/schema.js';
import { type SignUpSchemaType } from '../../schemas/auth.schema.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly passwordHasher: PasswordHasher,
    private readonly signinService: SignInService,
  ) {}

  async signup(body: SignUpSchemaType) {
    const hasehd = await this?.passwordHasher?.hash(body?.password);

    // throw new ZodError([
    //   {
    //     code: 'custom',
    //     path: ['email'],
    //     message: 'Email is blah',
    //   },
    // ]);

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

    const result = await this?.signinService?.signIn('1', {
      method: 'password',
      metadata: body,
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
      // result,
    };
  }
}
