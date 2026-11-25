import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigType } from '../../config/app.config.js';
import { UtilService } from './util.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        secret: configService?.getOrThrow('JWT_SECRET'),
      }),
    }),
  ],
  exports: [UtilService],
  providers: [UtilService, PasswordHasher],
})
export class UtilModule {}
