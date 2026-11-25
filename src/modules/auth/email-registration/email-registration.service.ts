import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Outbox } from '@nestjs/outbox';
import { differenceInMinutes } from 'date-fns';
import { ZodError } from 'zod';
import { OutboxConstants } from '../../../constants/outbox.constants.js';
import {
  sessionsTable,
  type DatabaseType,
} from '../../../databases/drizzle.database.js';
import {
  ApiResponseBodyType,
  SessionScopeType,
} from '../../../types/api-response-body.type.js';
import { UtilService } from '../../util/util.service.js';
import { type CreateUserDto } from './email-registration.dto.js';

@Injectable()
export class EmailRegistrationService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly utilService: UtilService,
    private readonly outbox: Outbox,
  ) {}

  async requestOtp(body: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email } = body?.session ?? {};
    if (!email) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is requried',
        },
      ]);
    }

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
          message: 'Cannot process with this email',
        },
      ]);
    }

    const scope: SessionScopeType = 'EMAIL_REGISTRATION_VERIFY';
    const sessionExist = await this?.db?.query?.sessionsTable?.findFirst({
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
    if (sessionExist) {
      const diff = differenceInMinutes(sessionExist?.expiresAt, new Date());
      // throw new ZodError([
      //   {
      //     code: 'custom',
      //     path: ['email'],
      //     message: `Wait for ${diff} minutes before requesting`,
      //   },
      // ]);
    }

    const code = this.utilService?.generateOtp(8);
    const token = await this.utilService?.hashString(code);
    const expiresAt = this.utilService?.addMinutes(5);
    let sessionCreate: ApiResponseBodyType['session'][] = [];

    const result = await this?.db?.transaction(async (tx) => {
      // insert something

      sessionCreate = await tx
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
              id: sessionCreate?.at(0)?.id,
              email,
              token: code,
            },
          } satisfies ApiResponseBodyType,
        },
      ]);
    });

    this?.outbox?.notify();

    const accessToken = this?.utilService?.jwtSignin({
      jwtPayload: {
        email,
        expiresAt,
        scope,
        sessionId: sessionCreate?.at(0)?.id,
      },
    });

    return {
      session: {
        token: accessToken,
      },
      jwtPayload: {
        email: code,
      },
    };
  }

  async verifyOtp(body: ApiResponseBodyType) {
    const { email } = body?.jwtPayload ?? {};
    const { token } = body?.session ?? {};

    return body;
  }

  async createUser(body: CreateUserDto) {
    return body;
  }
}
