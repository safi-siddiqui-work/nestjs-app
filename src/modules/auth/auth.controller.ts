import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { JwtUser } from '../../common/decorators/user.decorator.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';
import {
  type CreateUserV1Dto,
  createUserV1Schema,
  type EmailPasswordDto,
  emailPasswordSchema,
  type RequestOtpDto,
  requestOtpSchema,
  type VerifyOtpDto,
  verifyOtpSchema,
} from './auth.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email-registration/request-otp')
  emailRegistrationRequestOtp(
    @Body({
      schema: requestOtpSchema,
    })
    body: RequestOtpDto,
  ) {
    return this?.authService?.emailRegistrationRequestOtp({
      user: {
        email: body?.email,
      },
    });
  }

  @Auth('EMAIL_REGISTRATION_VERIFY')
  @Post('email-registration/verify-otp')
  emailRegistrationVerifyOtp(
    @Body({
      schema: verifyOtpSchema,
    })
    body: VerifyOtpDto,
    @JwtUser() jwtPayload: ApiResponseBodyType['jwtPayload'],
  ) {
    return this?.authService?.emailRegistrationVerifyOtp({
      jwtPayload,
      session: {
        extraCode: body?.code,
      },
    });
  }

  @Auth('EMAIL_REGISTRATION_CREATE')
  @Post('email-registration/create-user')
  emailRegistrationCreateUser(
    @Body({
      schema: createUserV1Schema,
    })
    body: CreateUserV1Dto,
    @JwtUser() jwtPayload: ApiResponseBodyType['jwtPayload'],
  ) {
    return this?.authService?.emailRegistrationCreateUser({
      user: body,
      jwtPayload,
    });
  }

  @Auth('USER_LOGIN')
  @Post('current-user/me')
  currentUser(@JwtUser() jwtPayload: ApiResponseBodyType['jwtPayload']) {
    return this?.authService?.currentUser({
      jwtPayload,
    });
  }

  @Post('email-password-login')
  emailPasswordLogin(
    @Body({
      schema: emailPasswordSchema,
    })
    body: EmailPasswordDto,
  ) {
    return this?.authService?.emailPasswordLogin({
      user: body,
    });
  }
}
