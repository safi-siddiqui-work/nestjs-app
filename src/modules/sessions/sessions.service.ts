import { PasswordHasher } from '@nestjs/authentication';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NonRetryableMessageError, Outbox } from '@nestjs/outbox';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import {
  sessionsTable,
  type DatabaseType,
} from '../../common/databases/drizzle.database.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';
import { JwtCustomService } from '../jwt-custom/jwt-custom.service.js';
import { UtilService } from '../util/util.service.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly outbox: Outbox,
    private readonly utilService: UtilService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtCustomService: JwtCustomService,
  ) {}

  sessionDto(
    session: ApiResponseBodyType['session'],
  ): ApiResponseBodyType['session'] {
    const { extraAccessToken } = session ?? {};
    return {
      extraAccessToken,
    };
  }

  async createOtpV1(body?: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    // v1 - creates otp, sends otp, returns access token - for guests

    const { topic } = body?.outbox ?? {};
    const { email, scope, extraExpiryMinutes } = body?.session ?? {};
    const scopeA = scope as string;

    if (!email || !scope || !topic) {
      throw new BadRequestException('email, scope, topic is required.');
    }

    // session valid
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
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
        expiresAt: true,
      },
    });
    if (sessionA) {
      const diff = this?.utilService?.differenceVerbose(sessionA?.expiresAt);
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: `Wait for ${diff} before requesting.`,
        },
      ]);
    }

    // session info
    const extraCode = this.utilService?.generateOtp(8);
    const token = await this.passwordHasher?.hash(extraCode);
    const expiresAt = this.utilService?.addMinutes(extraExpiryMinutes ?? 5);
    let sessionB: ApiResponseBodyType['session'][] = [];

    // outbox mail
    await this?.db?.transaction(async (tx) => {
      sessionB = await tx
        ?.insert(sessionsTable)
        ?.values({
          email,
          scope: scopeA,
          expiresAt,
          token,
        })
        ?.returning({
          id: sessionsTable?.id,
        });

      await this?.outbox?.add(tx, [
        {
          topic,
          payload: {
            session: {
              id: sessionB?.at(0)?.id,
              email,
              scope,
              extraCode,
            },
          } satisfies ApiResponseBodyType,
        },
      ]);
    });

    this?.outbox?.notify();

    // token
    const extraAccessToken = this?.jwtCustomService?.signin({
      jwtPayload: {
        email,
        expiresAt,
        scope,
        sessionId: sessionB?.at(0)?.id,
      },
    });

    return {
      session: {
        ...sessionB?.at(0),
        extraCode,
        extraAccessToken,
      },
    };
  }

  async checkOtpBeforeOutboxMail(body?: ApiResponseBodyType): Promise<void> {
    const { id, email, scope } = body?.session ?? {};

    if (!id || !email || !scope) {
      throw new BadRequestException('id, email, scope is required.');
    }

    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        id,
        email,
        scope,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: {
          isNull: true,
        },
        sentAt: {
          isNull: true,
        },
      },
      columns: {
        id: true,
      },
    });
    if (!sessionA) {
      throw new NonRetryableMessageError(
        `Sesson-${id} scope-${scope} email-${email} cannot be retried.`,
      );
    }
  }

  async updateOtpAfterOutboxMail(body?: ApiResponseBodyType): Promise<void> {
    const { id, mailId } = body?.session ?? {};

    if (!id) {
      throw new BadRequestException('id, is required.');
    }

    await this?.db
      ?.update(sessionsTable)
      ?.set({
        sentAt: new Date(),
        mailId,
      })
      ?.where(eq(sessionsTable?.id, id));
  }

  async verifyOtp(body?: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { extraCode, scope } = body?.session ?? {};
    const { sessionId, scope: scopeA, email } = body?.jwtPayload ?? {};

    if (!extraCode || !scope || !sessionId || !email || !scopeA) {
      throw new BadRequestException(
        'extraCode, scope, sessionId, email, scopeA is required.',
      );
    }

    if (scope !== scopeA) {
      throw new BadRequestException('scope is invlaid.');
    }

    // session valid
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        id: sessionId,
        email,
        scope: scope as string,
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
      extraCode,
      sessionA?.token,
    );
    if (!compare) {
      await this?.db
        ?.update(sessionsTable)
        ?.set({
          attampts: (sessionA?.attampts ?? 0) + 1,
        })
        ?.where(eq(sessionsTable?.id, sessionId));

      throw new ZodError([
        {
          code: 'custom',
          path: ['code'],
          message: 'Code is invalid',
        },
      ]);
    }

    // consume session
    const sessionB = await this?.consumeSession({ session: { id: sessionId } });

    return {
      session: {
        ...sessionA,
        ...sessionB,
      },
    };
  }

  async createSession(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { email, scope, userId, extraExpiryMinutes, extraExpiryDays } =
      body?.session ?? {};

    if (!email || !scope) {
      throw new BadRequestException('email, scope is required.');
    }

    // create session
    const token = this.utilService?.generateUuid();
    const hashed = await this.passwordHasher?.hash(token);
    const expiresAt = extraExpiryDays
      ? this?.utilService?.addDays(extraExpiryDays)
      : this.utilService?.addMinutes(extraExpiryMinutes ?? 5);

    const session = await this?.db
      ?.insert(sessionsTable)
      ?.values({
        userId,
        email,
        scope: scope as string,
        expiresAt,
        token: hashed,
      })
      .returning({ id: sessionsTable?.id });

    // token
    const extraAccessToken = this?.jwtCustomService?.signin({
      jwtPayload: {
        userId,
        email,
        expiresAt,
        scope,
        sessionId: session?.at(0)?.id,
        token,
      },
    });

    return {
      session: {
        ...session?.at(0),
        extraAccessToken,
      },
    };
  }

  async verifySession(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { scope } = body?.session ?? {};
    const { sessionId, scope: scopeA, email, token } = body?.jwtPayload ?? {};

    if (!scope || !sessionId || !email || !scopeA || !token) {
      throw new BadRequestException(
        'scope, sessionId, email, scopeA, token is required.',
      );
    }

    if (scope !== scopeA) {
      throw new BadRequestException('scope is invlaid.');
    }

    // session valid
    const sessionA = await this?.db?.query?.sessionsTable?.findFirst({
      where: {
        id: sessionId,
        email,
        scope: scope as string,
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

    // Otp valid
    const compare = await this?.passwordHasher?.verify(token, sessionA?.token);
    if (!compare) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['code'],
          message: 'Code is invalid',
        },
      ]);
    }

    return {
      session: sessionA,
    };
  }

  async consumeSession(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { id } = body?.session ?? {};

    if (!id) {
      throw new BadRequestException('id is required.');
    }

    // consume session
    const session = await this?.db
      ?.update(sessionsTable)
      ?.set({
        usedAt: new Date(),
      })
      ?.where(eq(sessionsTable?.id, id))
      ?.returning({
        usedAt: sessionsTable?.usedAt,
      });

    return {
      session: session?.at(0),
    };
  }
}
