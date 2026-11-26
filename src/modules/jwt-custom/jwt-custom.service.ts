import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { differenceInSeconds } from 'date-fns';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class JwtCustomService {
  constructor(private readonly jwtService: JwtService) {}

  signin(body: ApiResponseBodyType): string {
    return this?.jwtService?.sign(
      {
        userId: body?.jwtPayload?.userId,
        sessionId: body?.jwtPayload?.sessionId,
        email: body?.jwtPayload?.email,
        scope: body?.jwtPayload?.scope,
        expiresAt: body?.jwtPayload?.expiresAt,
        token: body?.jwtPayload?.token,
      } satisfies ApiResponseBodyType['jwtPayload'],
      {
        expiresIn: differenceInSeconds(
          body?.jwtPayload?.expiresAt ?? new Date(),
          new Date(),
        ),
      },
    );
  }
}
