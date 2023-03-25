import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api-key') {
  handleRequest(err, user, info, context) {
    return process.env.NODE_ENV === 'production'
      ? super.handleRequest(err, user, info, context)
      : true;
  }
}
