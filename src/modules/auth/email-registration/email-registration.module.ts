import { Module } from '@nestjs/common';
import { MailerCustomModule } from '../../mailer-custom/mailer-custom.module.js';
import { SessionsModule } from '../../sessions/sessions.module.js';
import { UsersModule } from '../../users/users.module.js';
import { UtilModule } from '../../util/util.module.js';
import { EmailRegistrationController } from './email-registration.controller.js';
import { EmailRegistrationHandler } from './email-registration.handler.js';
import { EmailRegistrationService } from './email-registration.service.js';

@Module({
  imports: [UtilModule, MailerCustomModule, UsersModule, SessionsModule],
  controllers: [EmailRegistrationController],
  providers: [EmailRegistrationService, EmailRegistrationHandler],
})
export class EmailRegistrationModule {}
