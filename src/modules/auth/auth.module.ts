import { Module } from '@nestjs/common';
import { EmailRegistrationModule } from './email-registration/email-registration.module.js';

@Module({
  imports: [EmailRegistrationModule],
})
export class AuthModule {}
