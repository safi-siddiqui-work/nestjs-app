import { Module } from '@nestjs/common';
import { AuthMailsHandler } from './handlers/auth-mails.handler.js';
import { EmailAuthMail } from './mails/email-auth.notification.js';

@Module({
  providers: [EmailAuthMail, AuthMailsHandler],
})
export class NotificationsModule {}
