import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseType } from '../types/api-response.type.js';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseType> {
    return next.handle()?.pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
