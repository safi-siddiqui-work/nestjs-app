import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiResponseBodyType } from '../types/api-response-body.type.js';

export const JwtUser = createParamDecorator<ApiResponseBodyType['jwtPayload']>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx?.switchToHttp()?.getRequest();
    const user = request?.user as ApiResponseBodyType['jwtPayload'];
    return user;
    //   return data ? request?.user?.[data] : request?.user;
  },
);
