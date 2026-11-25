import { Body, Controller, Post } from '@nestjs/common';
import { Auth } from '../../../decorators/auth.decorator.js';
import { JwtUser } from '../../../decorators/user.decorator.js';
import { ApiResponseBodyType } from '../../../types/api-response-body.type.js';
import {
  type CreateUserDto,
  createUserSchema,
  type RequestOtpDto,
  requestOtpSchema,
  type VerifyOtpDto,
  verifyOtpSchema,
} from './email-registration.dto.js';
import { EmailRegistrationService } from './email-registration.service.js';

@Controller('auth/email-registration')
export class EmailRegistrationController {
  constructor(
    private readonly emailRegistrationService: EmailRegistrationService,
  ) {}

  @Post('request-otp')
  requestOtp(
    @Body({
      schema: requestOtpSchema,
    })
    body: RequestOtpDto,
  ) {
    return this?.emailRegistrationService?.requestOtp({
      session: {
        email: body?.email,
      },
    });
  }

  @Auth('EMAIL_REGISTRATION_VERIFY')
  @Post('verify-otp')
  verifyOtp(
    @Body({
      schema: verifyOtpSchema,
    })
    body: VerifyOtpDto,
    @JwtUser() jwtPayload: ApiResponseBodyType['jwtPayload'],
  ) {
    return this?.emailRegistrationService?.verifyOtp({
      jwtPayload,
      session: {
        token: body?.code,
      },
    });
  }

  @Post('create-user')
  createUser(
    @Body({
      schema: createUserSchema,
    })
    body: CreateUserDto,
  ) {
    return this?.emailRegistrationService?.createUser(body);
  }
}
