import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PreviewModule } from '../preview/preview.module';
import { PrintServiceFactory } from './print.service.factory';
import configuration from './whatever.configuration';

@Module({
  imports: [
    PagedjsModule,
    PreviewModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [PrintServiceFactory],
  exports: [PrintServiceFactory],
})
export class WhateverModule {}
