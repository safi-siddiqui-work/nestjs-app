import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  ApiResponseBodyType,
  SessionScopeType,
} from '../types/api-response-body.type.js';

@Injectable()
export class AuthCustomGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload = request?.user as ApiResponseBodyType['jwtPayload'];

    const scope = this?.reflector?.get<SessionScopeType>(
      'scope',
      context?.getHandler(),
    );

    if (payload?.scope === scope) {
      return true;
    }

    return false;

    // const roles = this?.reflector?.get(Roles, context?.getHandler());
    // if (!roles) {
    //   return true;
    // }
    // if (roles?.includes('admin')) {
    //   const user = { email: 'random' };
    //   request.user = user;
    //   return true;
    // }
  }
}
