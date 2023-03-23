export interface PrinterOptions {
  debug?: boolean;
  headless?: boolean;
  allowLocal?: boolean;
  allowRemote?: boolean;
  additionalScripts?: string[];
  allowedPaths?: string[];
  allowedDomains?: string[];
  ignoreHTTPSErrors?: boolean;
  browserEndpoint?: string;
  browserArgs?: string[];
  overrideDefaultBackgroundColor?: boolean;
  timeout?: number;
  closeAfter?: boolean;
  emulateMedia?: string;
  styles?: string[];
  enableWarnings?: boolean;
}
