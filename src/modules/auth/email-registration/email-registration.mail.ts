import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';
import { MailConstants } from '../../../common/constants/mail.constants.js';
import { type ApiResponseBodyType } from '../../../common/types/api-response-body.type.js';

@Injectable()
export class EmailRegistrationRequestOtpMail implements Mailable<ApiResponseBodyType> {
  render(payload: ApiResponseBodyType) {
    const { token } = payload?.session ?? {};

    return {
      subject: 'Email Registration',
      template: `${MailConstants?.emailRegistration?.folder}/${MailConstants?.emailRegistration?.requestOtp}`,
      context: payload,
    };
  }
}
