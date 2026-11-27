import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { differenceInSeconds } from 'date-fns';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class JwtCustomService {
  constructor(private readonly jwtService: JwtService) {}

  signin(body: ApiResponseBodyType): string {
    const { expiresAt, scope, userId, sessionId, email, token } =
      body?.jwtPayload ?? {};

    if (!expiresAt || !scope) {
      throw new BadRequestException('expiresAt, scope is required');
    }

    if (!userId && !sessionId && !email) {
      throw new BadRequestException(
        'userId, sessionId, email, atleast is required',
      );
    }

    return this?.jwtService?.sign(
      {
        scope,
        expiresAt,
        userId,
        sessionId,
        email,
        token,
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
