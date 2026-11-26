import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigType } from '../../common/config/app.config.js';
import { JwtCustomService } from './jwt-custom.service.js';

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
  exports: [JwtCustomService],
  providers: [JwtCustomService],
})
export class JwtCustomModule {}
