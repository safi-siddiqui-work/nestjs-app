import { Module } from '@nestjs/common';
import { MailerCustomService } from './mailer-custom.service.js';

@Module({
  exports: [MailerCustomService],
  providers: [MailerCustomService],
})
export class MailerCustomModule {}
