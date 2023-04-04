import { Response } from 'express';
import { PrintStep } from 'src/pagedjs/print-step.enum';

export interface IPrintService {
  print(
    input: string | { url?: string; html?: string },
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    extraHttpHeaders: Record<string, string>[],
    currentStepCallback: (step: PrintStep) => void,
  ): Promise<any>;
  createResponse(
    data: any,
    download: boolean,
    fileName: string,
    response: Response,
  ): any;
}
