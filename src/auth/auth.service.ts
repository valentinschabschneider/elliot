import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  public validateApiKey(apiKey: string) {
    return this.configService.get<string>('apiKey') === apiKey;
  }

  public validateJwt(jwt: string) {
    try {
      return this.jwtService.verify(jwt, {
        secret: this.configService.get<string>('jwtSecret'),
      });
    } catch (e) {
      return false;
    }
  }
}
