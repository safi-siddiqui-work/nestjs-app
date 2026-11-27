import { Injectable, Type } from '@nestjs/common';
import {
  Mailable,
  MailableSendOptions,
  Mailer,
  MailError,
  MailSendResult,
} from '@nestjs/mail';
import { NonRetryableMessageError, OutboxHandlerContext } from '@nestjs/outbox';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class MailerCustomService {
  constructor(private readonly mailer: Mailer) {}

  async outboxSend<T = ApiResponseBodyType>({
    mailable,
    toAddress = 'safisiddiqui.work@gmail.com',
    payload,
    context,
  }: {
    mailable: Type<Mailable<T>>;
    toAddress?: string;
    payload?: T;
    context?: OutboxHandlerContext;
  }): Promise<MailSendResult> {
    try {
      return await this.mailer.send(mailable, {
        to: toAddress,
        data: payload,
        // Over SMTP, a redelivery of this message keeps its Message-ID; Resend gets the
        // key as its Idempotency-Key and refuses the duplicate
        idempotencyKey: context?.message?.id,
        signal: context?.signal,
        // The outbox retries with its own backoff, and dead-letters what never succeeds
        retry: false,
      } as MailableSendOptions<T>);
    } catch (error) {
      if (error instanceof MailError && error?.permanent) {
        throw new NonRetryableMessageError(error.message, { cause: error });
      }
      throw error;
    }
  }
}
