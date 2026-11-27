import { Injectable } from '@nestjs/common';
import { ZodError } from 'zod';
import { OutboxConstants } from '../../../common/constants/outbox.constants.js';
import { ApiResponseBodyType } from '../../../common/types/api-response-body.type.js';
import { SessionsService } from '../../sessions/sessions.service.js';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class EmailRegistrationService {
  constructor(
    // @InjectDrizzle()
    // private readonly db: DatabaseType,
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  async requestOtp(body: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email } = body?.session ?? {};

    // unique user
    await this?.usersService?.emailMustBeUnique({ email });

    const sessionRes = await this?.sessionsService?.createOtpV1({
      session: {
        email,
        scope: 'EMAIL_REGISTRATION_VERIFY',
      },
      outbox: {
        topic: OutboxConstants?.emailRegistrationVerify,
      },
    });

    console.log(sessionRes);

    return {
      session: {
        extraAccessToken: sessionRes?.session?.extraAccessToken,
      },
    };
  }

  async verifyOtp(body: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email } = body?.jwtPayload ?? {};

    // user unique
    await this?.usersService?.emailMustBeUnique({ email });

    const sessionResA = await this?.sessionsService?.verifyOtp({
      jwtPayload: body?.jwtPayload,
      session: {
        ...body?.session,
        scope: 'EMAIL_REGISTRATION_VERIFY',
      },
    });
    console.log(sessionResA);

    const sessionResB = await this?.sessionsService?.createSession({
      session: {
        email,
        scope: 'EMAIL_REGISTRATION_CREATE',
      },
    });
    console.log(sessionResB);

    return {
      session: {
        extraAccessToken: sessionResB?.session?.extraAccessToken,
      },
    };
  }

  async createUser(body: ApiResponseBodyType) {
    const { email, sessionId, token } = body?.jwtPayload ?? {};
    const { name, username, password } = body?.user ?? {};
    if (!email) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is required.',
        },
      ]);
    }
    if (!username) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: 'Username is required.',
        },
      ]);
    }

    // // user unique
    // await this?.usersService?.emailMustBeUnique({ email });

    // // session valid
    // const scopeA: SessionScopeType = 'EMAIL_REGISTRATION_CREATE';
    // const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
    //   where: {
    //     id: sessionId,
    //     email,
    //     scope: scopeA,
    //     expiresAt: {
    //       gt: new Date(),
    //     },
    //     usedAt: {
    //       isNull: true,
    //     },
    //   },
    //   columns: {
    //     token: true,
    //   },
    // });
    // if (!sessionA) {
    //   throw new ZodError([
    //     {
    //       code: 'custom',
    //       path: ['name'],
    //       message: 'Session is invalid',
    //     },
    //   ]);
    // }

    // // token valid
    // const compare = await this?.passwordHasher?.verify(
    //   token ?? '',
    //   sessionA?.token,
    // );
    // if (!compare) {
    //   throw new ZodError([
    //     {
    //       code: 'custom',
    //       path: ['name'],
    //       message: 'Session is invalid',
    //     },
    //   ]);
    // }

    // // consume session
    // await this?.db
    //   ?.update(sessionsTable)
    //   ?.set({
    //     usedAt: new Date(),
    //   })
    //   ?.where(eq(sessionsTable?.id, sessionId ?? 0));

    // // unique username
    // const userB = await this?.db?.query?.usersTable?.findFirst({
    //   where: {
    //     username,
    //   },
    // });
    // if (userB) {
    //   throw new ZodError([
    //     {
    //       code: 'custom',
    //       path: ['username'],
    //       message: 'Username is already taken',
    //     },
    //   ]);
    // }

    // // create user
    // const hashed = await this?.passwordHasher?.hash(password ?? '');
    // const userC = await this?.db
    //   ?.insert(usersTable)
    //   ?.values({
    //     email,
    //     name,
    //     username,
    //     password: hashed,
    //   })
    //   .returning();

    // if (this?.passwordHasher?.needsRehash(hashed)) {
    //   // upgrade old hashed passwords
    // }
    return {};
  }
}
