import { Injectable } from '@nestjs/common';
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
        extraCode: body?.session?.extraCode,
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

  async createUser(body: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { email, sessionId } = body?.jwtPayload ?? {};
    const { name, username, password } = body?.user ?? {};

    // user unique
    await this?.usersService?.emailMustBeUnique({ email });

    const sessionResA = await this?.sessionsService?.verifySession({
      jwtPayload: body?.jwtPayload,
      session: {
        scope: 'EMAIL_REGISTRATION_CREATE',
      },
    });
    console.log(sessionResA);

    // unique username
    await this?.usersService?.usernameMustBeUnique({ username });

    const userRes = await this?.usersService?.createUserV1({
      user: {
        email,
        name,
        username,
        password,
      },
    });
    console.log(userRes);

    // consume session
    await this?.sessionsService?.consumeSession({
      session: {
        id: sessionId,
      },
    });

    return {
      user: userRes?.user,
    };
  }
}
