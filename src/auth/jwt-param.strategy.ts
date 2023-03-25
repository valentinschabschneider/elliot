import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { AuthService } from './auth.service';

@Injectable()
export class JwtParamStrategy extends PassportStrategy(Strategy, 'jwt-param') {
  constructor(private readonly authService: AuthService) {
    super(async (req, done) => {
      if (this.authService.validateJwt(req.params.jwt)) {
        done(null, true);
      }
      done(new UnauthorizedException(), null);
    });
  }
}
