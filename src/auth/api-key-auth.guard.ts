import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  handleRequest(err, user, info, context) {
    return process.env.API_KEY !== undefined
      ? super.handleRequest(err, user, info, context)
      : true;
  }
}
