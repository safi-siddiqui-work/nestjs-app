import { Injectable } from '@nestjs/common';
import { ZodError } from 'zod';
import { OutboxConstants } from '../../common/constants/outbox.constants.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  async emailRegistrationRequestOtp(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { email } = body?.user ?? {};

    // unique user
    await this?.usersService?.emailMustBeUnique({
      user: {
        email,
      },
    });

    // send otp
    const sessionRes = await this?.sessionsService?.createOtpV1({
      session: {
        email,
        scope: 'EMAIL_REGISTRATION_VERIFY',
      },
      outbox: {
        topic: OutboxConstants?.auth?.emailRegistrationRequest,
      },
    });

    return {
      session: this?.sessionsService?.sessionDto(sessionRes?.session),
    };
  }

  async emailRegistrationVerifyOtp(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { email } = body?.jwtPayload ?? {};
    const { extraCode } = body?.session ?? {};

    // user unique
    await this?.usersService?.emailMustBeUnique({
      user: {
        email,
      },
    });

    // verify otp
    const sessionResA = await this?.sessionsService?.verifyOtp({
      jwtPayload: body?.jwtPayload,
      session: {
        extraCode,
        scope: 'EMAIL_REGISTRATION_VERIFY',
      },
    });

    // create session
    const sessionResB = await this?.sessionsService?.createSession({
      session: {
        email,
        scope: 'EMAIL_REGISTRATION_CREATE',
      },
    });

    return {
      session: this?.sessionsService?.sessionDto(sessionResB?.session),
    };
  }

  async emailRegistrationCreateUser(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { email, sessionId } = body?.jwtPayload ?? {};
    const { name, username, password } = body?.user ?? {};

    // user unique
    await this?.usersService?.emailMustBeUnique({ user: { email } });

    // unique username
    await this?.usersService?.usernameMustBeUnique({ user: { username } });

    // verify session
    const sessionResA = await this?.sessionsService?.verifySession({
      jwtPayload: body?.jwtPayload,
      session: {
        scope: 'EMAIL_REGISTRATION_CREATE',
      },
    });

    // create user
    const userRes = await this?.usersService?.createUserV1({
      user: {
        email,
        name,
        username,
        password,
      },
      outbox: {
        topic: OutboxConstants?.auth?.emailRegistrationCreate,
      },
    });

    // consume session
    await this?.sessionsService?.consumeSession({
      session: {
        id: sessionId,
      },
    });

    // create session
    const sessionResB = await this?.sessionsService?.createSession({
      session: {
        userId: userRes?.user?.id,
        email,
        scope: 'USER_LOGIN',
        extraExpiryDays: 7,
      },
    });

    return {
      user: this?.usersService?.userDto(userRes?.user),
      session: this?.sessionsService?.sessionDto(sessionResB?.session),
    };
  }

  async currentUser(body?: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email, expiresAt } = body?.jwtPayload ?? {};

    return {
      user: this?.usersService?.userDto({
        email,
      }),
      session: this?.sessionsService?.sessionDto({
        expiresAt,
      }),
    };
  }

  async emailPasswordLogin(
    body?: ApiResponseBodyType,
  ): Promise<ApiResponseBodyType> {
    const { email, password } = body?.user ?? {};

    const userRes = await this?.usersService?.findUser({
      user: {
        findFirst: {
          where: {
            email,
          },
          columns: {
            email: true,
            password: true,
            name: true,
            username: true,
          },
        },
      },
    });
    if (!userRes?.user) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email needs to be registered.',
        },
      ]);
    }

    const compare = await this?.usersService?.comparePasswords(
      password,
      userRes?.user?.password,
    );
    if (!compare) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Credentials are incorrect.',
        },
      ]);
    }

    // create session
    const sessionResB = await this?.sessionsService?.createSession({
      session: {
        userId: userRes?.user?.id,
        email,
        scope: 'USER_LOGIN',
        extraExpiryDays: 7,
      },
    });

    return {
      user: this?.usersService?.userDto(userRes?.user),
      session: this?.sessionsService?.sessionDto(sessionResB?.session),
    };
  }
}
