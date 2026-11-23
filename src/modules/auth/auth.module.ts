import { Module } from '@nestjs/common';
import { JwtAuth } from '../../providers/jwt-auth.provider.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuth],
})
export class AuthModule {}
