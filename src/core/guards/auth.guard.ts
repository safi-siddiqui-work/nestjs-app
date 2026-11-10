import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request & { user: unknown } = context
      ?.switchToHttp()
      ?.getRequest();

    const roles = this?.reflector?.get(Roles, context?.getHandler());

    if (!roles) {
      return true;
    }

    if (roles?.includes('admin')) {
      const user = { email: 'random' };
      request.user = user;
      return true;
    }

    return false;
  }
}
