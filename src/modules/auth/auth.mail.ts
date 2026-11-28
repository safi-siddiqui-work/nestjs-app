import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';
import { MailConstants } from '../../common/constants/mail.constants.js';
import { type ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class EmailRegistrationRequestOtpMail implements Mailable<ApiResponseBodyType> {
  render(payload: ApiResponseBodyType) {
    return {
      subject: 'Email Registration',
      template: `${MailConstants?.auth?.folder}/${MailConstants?.auth?.emailRegistration?.folder}/${MailConstants?.auth?.emailRegistration?.requestOtp}`,
      context: payload,
    };
  }
}

@Injectable()
export class EmailRegistrationCreateUserMail implements Mailable<ApiResponseBodyType> {
  render(payload: ApiResponseBodyType) {
    return {
      subject: `Welcome ${payload?.user?.name}`,
      template: `${MailConstants?.auth?.folder}/${MailConstants?.auth?.emailRegistration?.folder}/${MailConstants?.auth?.emailRegistration?.createUser}`,
      context: payload,
    };
  }
}
