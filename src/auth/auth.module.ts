import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ApiKeyStrategy } from './api-key.strategy';
import { AuthService } from './auth.service';
import { JwtParamStrategy } from './jwt-param.strategy';
import configuration from './auth.configuration';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [AuthService, ApiKeyStrategy, JwtParamStrategy],
  exports: [AuthService],
})
export class AuthModule {}
