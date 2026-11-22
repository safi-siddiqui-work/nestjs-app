import { Injectable } from '@nestjs/common';
import { Mailer, MailError } from '@nestjs/mail';
import {
  NonRetryableMessageError,
  OnOutboxMessage,
  type OutboxHandlerContext,
} from '@nestjs/outbox';
import { type ApiResponseBodyType } from '../../../types/api-response.type.js';
import { EmailAuthMail } from '../mails/email-auth.notification.js';

@Injectable()
export class AuthMailsHandler {
  constructor(private readonly mailer: Mailer) {}

  @OnOutboxMessage('email-auth.sent', { consumer: 'email-auth-confirmed' })
  async sendEmailAuth(
    payload: ApiResponseBodyType,
    { message, signal }: OutboxHandlerContext,
  ) {
    // Some db bad method
    if (false) {
      throw new NonRetryableMessageError('Permemntly cancel');
    }

    try {
      const mail = await this?.mailer?.send(EmailAuthMail, {
        to: {
          name: payload?.user?.name ?? 'NO_NAME',
          address: payload?.user?.email ?? 'NO_EMAIL',
        },
        data: {
          user: payload.user,
        },
        // Over SMTP, a redelivery of this message keeps its Message-ID; Resend gets the
        // key as its Idempotency-Key and refuses the duplicate
        idempotencyKey: message.id,
        signal,
        // The outbox retries with its own backoff, and dead-letters what never succeeds
        retry: false,
      });
    } catch (error) {
      if (error instanceof MailError && error.permanent) {
        throw new NonRetryableMessageError(error.message, { cause: error });
      }
      throw error;
    }
  }
}
