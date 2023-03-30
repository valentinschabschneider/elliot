import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from '../pagedjs/pagedjs.configuration';
import { PagedJsService } from './pagedjs.service';

const printerProvider = {
  provide: 'PRINTER',
  useFactory: async () => (await import('pagedjs-cli')).default,
};

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [printerProvider, PagedJsService],
  exports: [PagedJsService],
})
export class PagedjsModule {}
