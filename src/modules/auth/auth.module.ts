import { Module } from '@nestjs/common';
import { MailerCustomModule } from '../mailer-custom/mailer-custom.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { UsersModule } from '../users/users.module.js';
import { UtilModule } from '../util/util.module.js';
import { AuthController } from './auth.controller.js';
import { AuthHandler } from './auth.handler.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [UtilModule, MailerCustomModule, UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [AuthService, AuthHandler],
})
export class AuthModule {}
