import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Module({
  exports: [UsersService],
  providers: [UsersService, PasswordHasher],
})
export class UsersModule {}
