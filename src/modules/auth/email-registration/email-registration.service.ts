import { PasswordHasher } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Outbox } from '@nestjs/outbox';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { OutboxConstants } from '../../../common/constants/outbox.constants.js';
import {
  sessionsTable,
  usersTable,
  type DatabaseType,
} from '../../../common/databases/drizzle.database.js';
import {
  ApiResponseBodyType,
  SessionScopeType,
} from '../../../common/types/api-response-body.type.js';
import { JwtCustomService } from '../../jwt-custom/jwt-custom.service.js';
import { UtilService } from '../../util/util.service.js';

@Injectable()
export class EmailRegistrationService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly utilService: UtilService,
    private readonly jwtCustomService: JwtCustomService,
    private readonly passwordHasher: PasswordHasher,
    private readonly outbox: Outbox,
  ) {}

  private async checkUserExists(
    user: ApiResponseBodyType['user'],
  ): Promise<ApiResponseBodyType['user']> {
    const { email } = user ?? {};
    const userExist = await this?.db?.query?.usersTable?.findFirst({
      where: {
        email,
      },
      columns: {
        id: true,
      },
    });
    if (userExist) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is already taken.',
        },
      ]);
    }
    return userExist;
  }

  async requestOtp(body: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email } = body?.session ?? {};
    if (!email) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is required.',
        },
      ]);
    }

    // unique user
    await this?.checkUserExists({ email });

    // session valid
    const scope: SessionScopeType = 'EMAIL_REGISTRATION_VERIFY';
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        email,
        scope,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: {
          isNull: true,
        },
      },
      columns: {
        expiresAt: true,
      },
    });
    if (sessionA) {
      const diff = this?.utilService?.differenceVerbose(sessionA?.expiresAt);
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: `Wait for ${diff} minutes before requesting`,
        },
      ]);
    }

    // session info
    const code = this.utilService?.generateOtp(8);
    const token = await this.passwordHasher?.hash(code);
    const expiresAt = this.utilService?.addMinutes(5);
    let sessionB: ApiResponseBodyType['session'][] = [];

    // outbox
    await this?.db?.transaction(async (tx) => {
      sessionB = await tx
        ?.insert(sessionsTable)
        ?.values({
          email,
          scope,
          expiresAt,
          token,
        })
        ?.returning({
          id: sessionsTable?.id,
        });

      await this?.outbox?.add(tx, [
        {
          topic: OutboxConstants?.emailRegistrationVerify,
          payload: {
            session: {
              id: sessionB?.at(0)?.id,
              email,
              scope,
              token: code,
            },
          } satisfies ApiResponseBodyType,
        },
      ]);
    });

    this?.outbox?.notify();

    // token
    const accessToken = this?.jwtCustomService?.signin({
      jwtPayload: {
        email,
        expiresAt,
        scope,
        sessionId: sessionB?.at(0)?.id,
      },
    });

    return {
      session: {
        token: accessToken,
      },
    };
  }

  async verifyOtp(body: ApiResponseBodyType) {
    const { email, sessionId } = body?.jwtPayload ?? {};
    const { token } = body?.session ?? {};
    if (!email) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is required.',
        },
      ]);
    }
    // user unique
    await this?.checkUserExists({ email });

    // session valid
    const scopeA: SessionScopeType = 'EMAIL_REGISTRATION_VERIFY';
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        id: sessionId,
        email,
        scope: scopeA,
        expiresAt: {
          gt: new Date(),
        },
        attampts: {
          lte: 5,
        },
        usedAt: {
          isNull: true,
        },
        sentAt: {
          isNotNull: true,
        },
      },
      columns: {
        token: true,
        attampts: true,
      },
    });
    if (!sessionA) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['code'],
          message: 'Session is invalid',
        },
      ]);
    }

    // Otp valid
    const compare = await this?.passwordHasher?.verify(
      token ?? '',
      sessionA?.token,
    );
    if (!compare) {
      await this?.db
        ?.update(sessionsTable)
        ?.set({
          attampts: (sessionA?.attampts ?? 0) + 1,
        })
        ?.where(eq(sessionsTable?.id, sessionId ?? 0));

      throw new ZodError([
        {
          code: 'custom',
          path: ['code'],
          message: 'Code is invalid',
        },
      ]);
    }

    // consume session
    await this?.db
      ?.update(sessionsTable)
      ?.set({
        usedAt: new Date(),
      })
      ?.where(eq(sessionsTable?.id, sessionId ?? 0));

    // create session
    const scopeB: SessionScopeType = 'EMAIL_REGISTRATION_CREATE';
    const tokenB = this.utilService?.generateUuid();
    const hashedB = await this.passwordHasher?.hash(tokenB);
    const expiresAtB = this.utilService?.addMinutes(5);

    const sessionB = await this?.db
      ?.insert(sessionsTable)
      ?.values({
        email,
        scope: scopeB,
        expiresAt: expiresAtB,
        token: hashedB,
      })
      .returning({ id: sessionsTable?.id });

    // token
    const accessToken = this?.jwtCustomService?.signin({
      jwtPayload: {
        email,
        expiresAt: expiresAtB,
        scope: scopeB,
        sessionId: sessionB?.at(0)?.id,
        token: tokenB,
      },
    });

    return {
      session: {
        token: accessToken,
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

    // user unique
    await this?.checkUserExists({ email });

    // session valid
    const scopeA: SessionScopeType = 'EMAIL_REGISTRATION_CREATE';
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        id: sessionId,
        email,
        scope: scopeA,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: {
          isNull: true,
        },
      },
      columns: {
        token: true,
      },
    });
    if (!sessionA) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['name'],
          message: 'Session is invalid',
        },
      ]);
    }

    // token valid
    const compare = await this?.passwordHasher?.verify(
      token ?? '',
      sessionA?.token,
    );
    if (!compare) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['name'],
          message: 'Session is invalid',
        },
      ]);
    }

    // consume session
    await this?.db
      ?.update(sessionsTable)
      ?.set({
        usedAt: new Date(),
      })
      ?.where(eq(sessionsTable?.id, sessionId ?? 0));

    // unique username
    const userB = await this?.db?.query?.usersTable?.findFirst({
      where: {
        username,
      },
    });
    if (userB) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: 'Username is already taken',
        },
      ]);
    }

    // create user
    const hashed = await this?.passwordHasher?.hash(password ?? '');
    const userC = await this?.db
      ?.insert(usersTable)
      ?.values({
        email,
        name,
        username,
        password: hashed,
      })
      .returning();

    // if (this?.passwordHasher?.needsRehash(hashed)) {
    //   // upgrade old hashed passwords
    // }
    return {};
  }
}
