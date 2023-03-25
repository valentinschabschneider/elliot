import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrintController } from './print.controller';
import { PrintService } from './print.service';
import configuration from './print.configuration';

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
