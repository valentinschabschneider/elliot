import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';

export interface IPrintService {
  print(
    input: string | { url?: string; html?: string },
    download: boolean,
    fileName: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    response: Response,
  ): Promise<StreamableFile | string>;
}
