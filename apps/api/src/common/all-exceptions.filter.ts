import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) || crypto.randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'Beklenmeyen bir sunucu hatası oluştu.';
    let errorDetails: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        errorMessage = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        errorMessage = body.message || exception.message;
        errorCode = body.error || `HTTP_${status}`;
        errorDetails = body.details || (Array.isArray(body.message) ? body.message : undefined);

        if (Array.isArray(body.message)) {
          errorMessage = body.message[0] || errorMessage;
        }
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorCode = exception.name;
    }

    // Mask sensitive details and log internally
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status: ${status} - Error: ${errorMessage}`,
      exception instanceof Error ? exception.stack : ''
    );

    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        requestId,
        details: errorDetails,
      },
    });
  }
}
