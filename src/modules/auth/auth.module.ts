import { Module } from '@nestjs/common';
import { SessionAuthProvider } from '../../providers/session-auth.provider.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthProvider],
})
export class AuthModule {}
