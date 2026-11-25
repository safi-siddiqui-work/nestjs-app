import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // constructor(private readonly reflector: Reflector) {
  //   super();
  // }
  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  //   // Add your custom authentication logic here
  //   // for example, call super.logIn(request) to establish a session.
  //   const request = context.switchToHttp().getRequest();
  //   const payload = request?.user as ApiResponseBodyType['jwtPayload'];
  //   const scope = this?.reflector?.get<SessionScopeType>(
  //     'scope',
  //     context?.getHandler(),
  //   );
  //
  //   if (payload?.scope === scope) {
  //     return super.canActivate(context);
  //   }
  //   return false;
  // }
  // handleRequest(err: any, user: any, info: any) {
  //   // You can throw an exception based on either "info" or "err" arguments
  //   if (err || !user) {
  //     throw err || new UnauthorizedException();
  //   }
  //   return user;
  // }
}
