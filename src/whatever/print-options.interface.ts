import { PrintInput } from './print-input.interface';
import { PrintOutputType } from './print-output-type.enum';

export interface PrintOptions {
  input: PrintInput;
  outputType: PrintOutputType;
  additionalScripts: string[];
  timeout: number;
  injectPolyfill: boolean;
  httpHeaders: Record<string, string>[];
}
