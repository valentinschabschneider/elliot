import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { ApiKeyStrategy } from './api-key.strategy';
import configuration from './auth.configuration';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [AuthService, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
