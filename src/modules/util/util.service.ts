import { PasswordHasher } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addMinutes, differenceInSeconds } from 'date-fns';
import { randomInt } from 'node:crypto';
import { ApiResponseBodyType } from '../../types/api-response-body.type.js';

@Injectable()
export class UtilService {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  generateOtp(numLength: number = 8): string {
    return randomInt(0, Math.pow(10, numLength))
      .toString()
      .padStart(numLength, '0');
  }

  hashString(value: string = ''): Promise<string> {
    return this.passwordHasher?.hash(value);
  }

  jwtSignin(body: ApiResponseBodyType): string {
    return this?.jwtService?.sign(
      {
        userId: body?.jwtPayload?.userId,
        sessionId: body?.jwtPayload?.sessionId,
        email: body?.jwtPayload?.email,
        scope: body?.jwtPayload?.scope,
        expiresAt: body?.jwtPayload?.expiresAt,
      } satisfies ApiResponseBodyType['jwtPayload'],
      {
        expiresIn: differenceInSeconds(
          body?.jwtPayload?.expiresAt ?? new Date(),
          new Date(),
        ),
      },
    );
    // return this.passwordHasher?.hash(value);
  }

  addMinutes(minutes: number = 0, date: Date = new Date()): Date {
    return addMinutes(date, minutes);
  }
}
