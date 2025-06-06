import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authService: AuthService) {
    super(
      { header: 'X-API-KEY', prefix: '' }, // options
      false, // passReqToCallback
    );
  }

  async validate(apiKey: string, done: (err: any, user?: any) => void) {
    const user = await this.authService.validateApiKey(apiKey);
    if (!user) {
      return done(new UnauthorizedException(), null);
    }
    return done(null, user);
  }
}
