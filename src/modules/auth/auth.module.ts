import { PasswordHasher } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailRegistrationModule } from './email-registration/email-registration.module.js';

@Module({
  imports: [
    // PassportModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService<AppConfigType>) => ({
    //     global: true,
    //     secret: configService?.getOrThrow('JWT_SECRET'),
    //     // signOptions: {
    //     //   expiresIn: '30s',
    //     // },
    //   }),
    // }),

    EmailRegistrationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordHasher],
})
export class AuthModule {}
