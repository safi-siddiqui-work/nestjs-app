import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodError } from 'zod';
import { ApiResponseType, ErrorType } from '../types/api-response.type.js';

@Catch()
export class EveryExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor, so resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host?.switchToHttp();

    // let httpStatus = HttpStatus?.INTERNAL_SERVER_ERROR;
    let error: ErrorType = {
      message: 'Internal server error has occured',
      status: HttpStatus?.INTERNAL_SERVER_ERROR,
      path: httpAdapter?.getRequestUrl(ctx?.getRequest()),
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const httpEerror = exception?.getResponse() as ErrorType;
      error = {
        message: httpEerror?.message ?? 'Http Exception Failure',
        status: exception?.getStatus(),
        issues: httpEerror?.issues,
      };
    }

    if (exception instanceof ZodError) {
      error = {
        message: 'Zod Excpetion Failure',
        status: HttpStatus.BAD_REQUEST,
        issues: exception?.issues,
      };
    }

    const responseBody: ApiResponseType = {
      success: false,
      error,
    };

    httpAdapter?.reply(ctx?.getResponse(), responseBody, error?.status);
  }
}
