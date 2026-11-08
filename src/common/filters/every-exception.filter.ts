import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

type ModifiedError = Error & { issues?: [] };

@Catch()
export class EveryExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor, so resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host?.switchToHttp();

    let httpStatus = HttpStatus?.INTERNAL_SERVER_ERROR;
    let error: ModifiedError = {
      name: 'Internal Server Error',
      message: 'Internal server error has occured',
    };

    if (exception instanceof HttpException) {
      httpStatus = exception?.getStatus();
      // error = {
      //   name: exception?.name,
      //   message: exception?.message,
      // };
      error = exception?.getResponse() as ModifiedError;

      // const expRes = exception?.errors;

      // console.log(exception?.getResponse());
      // console.log(exception);
    }
    // if (exception instanceof ZodError) {
    //   httpStatus = HttpStatus.BAD_REQUEST;
    //   error = {
    //     name: 'Bad Request',
    //     message: 'Validation has failed',
    //   };
    //   zodError = exception?.issues;
    // }

    // console.log(exception);

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter?.getRequestUrl(ctx?.getRequest()),
      error,
    };

    httpAdapter?.reply(ctx?.getResponse(), responseBody, httpStatus);
  }
}
