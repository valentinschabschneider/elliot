import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrintModule } from './print/print.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules/pagedjs/dist'),
      serveRoot: '/dist',
    }),
    PrintModule,
  ],
})
export class AppModule {}
