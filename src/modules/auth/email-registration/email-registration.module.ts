import { Module } from '@nestjs/common';
import { UtilModule } from '../../util/util.module.js';
import { EmailRegistrationController } from './email-registration.controller.js';
import { EmailRegistrationService } from './email-registration.service.js';

@Module({
  imports: [UtilModule],
  controllers: [EmailRegistrationController],
  providers: [EmailRegistrationService],
})
export class EmailRegistrationModule {}
