import { PrintInput } from './print-input.interface';
import { PrintOutputType } from './print-output-type.enum';

export class PrintOptionsModel {
  input: PrintInput;
  outputType: PrintOutputType;
  additionalScripts: string[];
  timeout: number;
  injectPolyfill: boolean;
}
