import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthCustomGuard } from '../guards/custom-auth.guard.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { SessionScopeType } from '../types/api-response-body.type.js';

export function Auth(scope?: SessionScopeType, guards: [] = []) {
  return applyDecorators(
    SetMetadata('scope', scope),
    UseGuards(JwtAuthGuard, AuthCustomGuard, ...guards),
    // UseGuards(JwtAuthGuard, ...guards),
    // UseGuards(AuthGuard, RolesGuard),
    // ApiBearerAuth(),
    // ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
