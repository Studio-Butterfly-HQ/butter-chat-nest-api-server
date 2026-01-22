import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResponseUtil } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        details = responseObj.error || responseObj.message;
        
        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          details = responseObj.message;
        }
      }

      // Set error codes based on status
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          code = 'BAD_REQUEST';
          break;
        case HttpStatus.UNAUTHORIZED:
          code = 'UNAUTHORIZED';
          break;
        case HttpStatus.FORBIDDEN:
          code = 'FORBIDDEN';
          break;
        case HttpStatus.NOT_FOUND:
          code = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          code = 'CONFLICT';
          break;
        case HttpStatus.UNPROCESSABLE_ENTITY:
          code = 'UNPROCESSABLE_ENTITY';
          break;
        default:
          code = 'ERROR';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    // Use ResponseUtil.error
    const errorResponse = ResponseUtil.error(
      message,
      code,
      details,
      request.url
    );

    response.status(status).json(errorResponse);
  }
}