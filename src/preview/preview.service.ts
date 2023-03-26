import { Injectable, Logger } from '@nestjs/common';

import { PagedJsService } from '../pagedjs/pagedjs.service';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  constructor(private readonly pagedjsService: PagedJsService) {}

  public async generateHTML(
    url: string,
    additionalScripts: string[],
    timeout: number,
  ): Promise<string> {
    return this.pagedjsService.generateHTML(
      url,
      this.pagedjsService.createPrinter({
        additionalScripts,
        timeout,
        emulateMedia: 'screen',
        closeAfter: false,
      }),
    );
  }
}
