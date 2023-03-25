import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ConditionalHtmlExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    response.status(status);

    if (request.headers['x-json-error-response'] !== undefined) {
      response.contentType('application/json');
      response.json(exception.getResponse());
    } else {
      response.contentType('text/html');

      response.status(status).send(`
      <h1>Error ${status}</h1>
      <p>${exception.message}</p>
    `);
    }
  }
}
