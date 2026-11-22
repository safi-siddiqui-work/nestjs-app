import { Injectable } from '@nestjs/common';
import type { Mailable } from '@nestjs/mail';
import { ApiResponseBodyType } from '../../../types/api-response.type.js';

@Injectable()
export class EmailAuthMail implements Mailable<ApiResponseBodyType> {
  render(payload: ApiResponseBodyType) {
    return {
      subject: `Your otp code 555666`,
      template: 'email-auth',
      context: {
        code: 555111222,
        user: payload?.user,
      },
    };
  }
}
