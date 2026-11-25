import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Mailer, MailError } from '@nestjs/mail';
import {
  NonRetryableMessageError,
  OnOutboxMessage,
  type OutboxHandlerContext,
} from '@nestjs/outbox';
import { OutboxConstants } from '../../../constants/outbox.constants.js';
import { type DatabaseType } from '../../../databases/drizzle.database.js';
import { type ApiResponseBodyType } from '../../../types/api-response-body.type.js';
import { EmailAuthMail } from '../mails/email-auth.notification.js';

@Injectable()
export class AuthMailsHandler {
  constructor(
    private readonly mailer: Mailer,
    @InjectDrizzle()
    private readonly db: DatabaseType,
  ) {}

  @OnOutboxMessage('email-auth.sent', { consumer: 'email-auth-consumer' })
  async sendEmailAuth(
    payload: ApiResponseBodyType,
    { message, signal, processInTransaction }: OutboxHandlerContext,
  ) {
    // Some db bad method
    // EG; Already emailed
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
          user: payload?.user,
        },
        // Over SMTP, a redelivery of this message keeps its Message-ID; Resend gets the
        // key as its Idempotency-Key and refuses the duplicate
        idempotencyKey: message?.id,
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

    // Mails close gap with idempotency key, while db transactions close with processIntTranstaion
    // Beneficial when inbox has gap
    // Eg: if the process dies after the email is sent but before the id is recorded
    // the email is sent again on redelivery. Acceptable for email but not for db record
    // Insert the inbox record through tx, then calls work only if this consumer hasn't processed the message yet
    /*
    await this?.db?.transaction(
      async (tx) =>
        // await processInTransaction(tx, work)
        //
        await processInTransaction(tx, async () => {
          // Mark email a ssent
          // OR
          // const users = await tx?.query?.usersTable?.findMany();
          // if (users?.length < 0) {
          //   throw new NonRetryableMessageError('Cannot send email auth');
          // }
        }),
    );
    */
  }

  @OnOutboxMessage(OutboxConstants?.emailRegistrationVerify, {
    consumer: `${OutboxConstants?.emailRegistrationVerify}-consumer`,
  })
  async emailRegistrationVerify(
    payload: ApiResponseBodyType,
    { message, signal, processInTransaction }: OutboxHandlerContext,
  ) {
    // Some db bad method
    // EG; Already emailed
    if (false) {
      throw new NonRetryableMessageError('Permemntly cancel');
    }

    try {
      // const mail = await this?.mailer?.send(EmailAuthMail, {
      //   to: {
      //     name: payload?.user?.name ?? 'NO_NAME',
      //     address: payload?.user?.email ?? 'NO_EMAIL',
      //   },
      //   data: {
      //     user: payload?.user,
      //   },
      //   // Over SMTP, a redelivery of this message keeps its Message-ID; Resend gets the
      //   // key as its Idempotency-Key and refuses the duplicate
      //   idempotencyKey: message?.id,
      //   signal,
      //   // The outbox retries with its own backoff, and dead-letters what never succeeds
      //   retry: false,
      // });
    } catch (error) {
      if (error instanceof MailError && error.permanent) {
        throw new NonRetryableMessageError(error.message, { cause: error });
      }
      throw error;
    }

    // Mails close gap with idempotency key, while db transactions close with processIntTranstaion
    // Beneficial when inbox has gap
    // Eg: if the process dies after the email is sent but before the id is recorded
    // the email is sent again on redelivery. Acceptable for email but not for db record
    // Insert the inbox record through tx, then calls work only if this consumer hasn't processed the message yet
    /*
    await this?.db?.transaction(
      async (tx) =>
        // await processInTransaction(tx, work)
        //
        await processInTransaction(tx, async () => {
          // Mark email a ssent
          // OR
          // const users = await tx?.query?.usersTable?.findMany();
          // if (users?.length < 0) {
          //   throw new NonRetryableMessageError('Cannot send email auth');
          // }
        }),
    );
    */
  }
}
