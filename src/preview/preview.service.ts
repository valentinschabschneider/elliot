import { readFileSync } from 'fs';

import { Injectable, Logger } from '@nestjs/common';

import { join } from 'path';
import { PagedJsService } from '../pagedjs/pagedjs.service';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  constructor(private readonly pagedjsService: PagedJsService) {}

  public async generateHTML(
    url: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
  ): Promise<string> {
    return this.pagedjsService.generateHTML(
      url,
      this.pagedjsService.createPrinter({
        additionalScripts,
        timeout,
        emulateMedia: 'screen',
        closeAfter: false,
        disableScriptInjection: !injectPolyfill,
      }),
      readFileSync(join(__dirname, 'browser-warning.js'), 'utf8'),
    );
  }
}
