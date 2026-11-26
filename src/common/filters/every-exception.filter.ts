import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { MailError } from '@nestjs/mail';
import { ZodError } from 'zod';
import { ApiResponseType, ErrorType } from '../types/api-response.type.js';

@Catch()
export class EveryExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor, so resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host?.switchToHttp();

    let error: ErrorType = {
      message: exception?.message ?? 'Internal server error has occured',
      status: HttpStatus?.INTERNAL_SERVER_ERROR,
      path: httpAdapter?.getRequestUrl(ctx?.getRequest()),
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const httpEerror = exception?.getResponse() as ErrorType;
      error = {
        message: httpEerror?.message ?? 'Http Exception Failure',
        status: exception?.getStatus() ?? HttpStatus.BAD_REQUEST,
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

    if (exception instanceof MailError) {
      error = {
        message: exception?.message ?? 'Mail Excpetion Failure',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    const responseBody: ApiResponseType = {
      success: false,
      error,
    };

    httpAdapter?.reply(ctx?.getResponse(), responseBody, error?.status);
  }
}

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host?.switchToHttp();
//     const response = ctx?.getResponse<Response>();
//     const request = ctx?.getRequest<Request>();
//     const status = exception?.getStatus();

//     response?.status(status)?.json({
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request?.url,
//     });
//   }
// }
