import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import {
  FrameAddScriptTagOptions,
  FrameAddStyleTagOptions,
} from 'puppeteer-core';

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  constructor() {}

  public getStyles(): FrameAddStyleTagOptions[] {
    return [
      {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.5.0/toastify.min.css',
      },
    ];
  }

  public getScripts(): FrameAddScriptTagOptions[] {
    return [
      {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.5.0/toastify.min.js',
      },
      {
        content: readFileSync(join(__dirname, 'browser-warning.js'), 'utf8'),
      },
    ];
  }
}
