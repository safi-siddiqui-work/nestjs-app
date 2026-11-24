import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigType } from '../../config/app.config.js';
import { JwtStrategy } from '../../strategies/jwt.strategy.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfigType>) => ({
        global: true,
        secret: configService?.getOrThrow('JWT_SECRET'),
        // signOptions: {
        //   expiresIn: '30s',
        // },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordHasher, JwtStrategy],
})
export class AuthModule {}
