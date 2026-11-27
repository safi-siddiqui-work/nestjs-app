import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { JwtCustomModule } from '../jwt-custom/jwt-custom.module.js';
import { UtilModule } from '../util/util.module.js';
import { SessionsService } from './sessions.service.js';

@Module({
  imports: [UtilModule, JwtCustomModule],
  exports: [SessionsService],
  providers: [SessionsService, PasswordHasher],
})
export class SessionsModule {}
