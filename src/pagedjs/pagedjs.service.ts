import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Printer, PrinterOptions, RenderInput } from 'pagedjs-cli';
import {
  FrameAddScriptTagOptions,
  FrameAddStyleTagOptions,
} from 'puppeteer-core';

import { PagedJsException } from './pagedjs.exception';
import { PrintStep } from './print-step.enum';

@Injectable()
export class PagedJsService {
  private readonly logger = new Logger(PagedJsService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('PRINTER') private readonly CPrinter: typeof Printer,
  ) {}

  public createPrinter(
    printerOptions: PrinterOptions,
    currentStepCallback: (step: PrintStep) => void,
  ): Printer {
    // TODO: move to function
    printerOptions.browserEndpoint =
      printerOptions.browserEndpoint ??
      this.configService.get<string>('browserEndpoint');

    const timeout = Math.min(
      ...[
        printerOptions.timeout,
        this.configService.get<number>('maxTimeout'),
      ].filter(Number.isFinite),
    );

    printerOptions.timeout = timeout !== Infinity ? timeout : undefined;

    printerOptions.debug =
      printerOptions.debug ?? this.configService.get('debug') == 'true'; // doesn't just return boolean for some reason

    printerOptions.additionalScripts = [
      ...(printerOptions.additionalScripts ?? []),
      ...this.configService.get<string[]>('additionalScripts'),
    ];

    if (printerOptions.additionalScripts.length > 0) {
      this.logger.log(
        'Will inject additional scripts: ' +
          JSON.stringify(printerOptions.additionalScripts),
      );
    }

    printerOptions.extraHTTPHeaders = [
      ...(printerOptions.extraHTTPHeaders ?? []),
      ...this.configService.get<string[]>('httpHeaders'),
    ].reduce((acc, header) => {
      const [name, value] = header.split(':').map((s) => s.trim());
      if (name && value) {
        acc[name] = value;
      }
      return acc;
    });

    if (printerOptions.extraHTTPHeaders.length > 0) {
      this.logger.log(
        'Will add http headers: ' +
          JSON.stringify(printerOptions.extraHTTPHeaders),
      );
    }

    const printer = new this.CPrinter(printerOptions);

    printer.on('page', (page) => {
      if (page.position === 0) {
        this.logger.log('Loaded');
      }

      this.logger.debug(`Rendering page ${page.position + 1}`);

      currentStepCallback(PrintStep.RENDERING);
    });

    printer.on('rendered', (msg) => {
      this.logger.log(msg);
      this.logger.log('Generating');

      currentStepCallback(PrintStep.GENERATING);
    });

    printer.on('postprocessing', () => {
      this.logger.log('Generated');
      this.logger.log('Processing');

      currentStepCallback(PrintStep.POST_PROCESSING);
    });

    return printer;
  }

  public async printPdf(
    input: RenderInput,
    printer: Printer,
    currentStepCallback: (step: PrintStep) => void,
  ): Promise<Uint8Array> {
    this.logger.log(`Generate pdf from ${input.url ?? 'html'}`);

    currentStepCallback(PrintStep.LOADING);

    try {
      const file = await printer.pdf(input, {
        outlineTags: ['h1', 'h2', 'h3'], // TODO: research meaning and make configurable
        width: undefined,
        height: undefined,
        orientation: undefined,
      });

      this.logger.log('Processed');

      return file;
    } catch (error) {
      console.error(error);
      throw new PagedJsException(error);
    }
  }

  public async generateHTML(
    input: RenderInput,
    printer: Printer,
    currentStepCallback: (step: PrintStep) => void,
    additionalStylesAfter: FrameAddStyleTagOptions[] = [],
    additionalScriptsAfter: FrameAddScriptTagOptions[] = [],
  ): Promise<string> {
    this.logger.log(`Generate html from ${input.url ?? 'html'}`);

    currentStepCallback(PrintStep.LOADING);

    try {
      const page = await printer.preview(input);

      this.logger.log('Generated');
      this.logger.log('Processing');

      currentStepCallback(PrintStep.POST_PROCESSING);

      // remove the scripts so that it doesn't get executed again on the client
      await page.evaluate(() => {
        const scripts = Array.from(
          document.head.querySelectorAll('script'),
        ).filter((script) => !script.hasAttribute('keep'));

        scripts.forEach((script) => script.parentNode.removeChild(script));
      });

      for await (const style of additionalStylesAfter) {
        await page.addStyleTag(style);
      }

      for await (const script of additionalScriptsAfter) {
        await page.addScriptTag(script);
      }

      const html = await page.content();

      await page.close();
      await printer.close();

      this.logger.log('Processed');

      return html;
    } catch (error) {
      console.error(error.message);
      throw new PagedJsException(error);
    }
  }
}
