import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrintController } from './print.controller';
import { PrintService } from './print.service';
import configuration from './print.configuration';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    JwtModule,
  ],
  controllers: [PrintController],
  providers: [PrintService],
})
export class PrintModule {}
