import { Response } from 'express';
import { PrintStep } from '../pagedjs/print-step.enum';
import { CookieDto } from '../print/dto/print.dto';

export interface IPrintService {
  print(
    input: string | { url?: string; html?: string },
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    httpHeaders: Record<string, string>,
    cookies: CookieDto[],
    currentStepCallback: (step: PrintStep) => void,
    compressionLevel: number,
  ): Promise<any>;
  createResponse(data: any, response: Response): any;
}
