import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { JwtCustomModule } from '../../jwt-custom/jwt-custom.module.js';
import { UtilModule } from '../../util/util.module.js';
import { EmailRegistrationController } from './email-registration.controller.js';
import { EmailRegistrationHandler } from './email-registration.handler.js';
import { EmailRegistrationService } from './email-registration.service.js';

@Module({
  imports: [UtilModule, JwtCustomModule],
  controllers: [EmailRegistrationController],
  providers: [
    EmailRegistrationService,
    EmailRegistrationHandler,
    PasswordHasher,
  ],
})
export class EmailRegistrationModule {}
