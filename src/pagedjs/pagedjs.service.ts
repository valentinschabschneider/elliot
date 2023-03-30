import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Printer, PrinterOptions, RenderInput } from 'pagedjs-cli';

import { PagedJsException } from './pagedjs.exception';

@Injectable()
export class PagedJsService {
  private readonly logger = new Logger(PagedJsService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('PRINTER') private readonly CPrinter: typeof Printer,
  ) {}

  public createPrinter(printerOptions: PrinterOptions): Printer {
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

    const printer = new this.CPrinter(printerOptions);

    printer.on('page', (page) => {
      if (page.position === 0) {
        this.logger.log('Loaded');

        this.logger.log('Rendering: Page ' + (page.position + 1));
      } else {
        this.logger.log('Rendering: Page ' + (page.position + 1));
      }
    });

    printer.on('rendered', (msg) => {
      this.logger.log(msg);
      this.logger.log('Generating');
    });

    printer.on('postprocessing', (msg) => {
      this.logger.log(msg);
      this.logger.log('Generated');
      this.logger.log('Processing');
    });

    return printer;
  }

  public async printPdf(
    input: string | RenderInput,
    printer: Printer,
  ): Promise<Uint8Array> {
    this.logger.log('Print: ' + input);

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
      this.logger.error(error);
      throw new PagedJsException();
    }
  }

  public async generateHTML(
    input: string | RenderInput,
    printer: Printer,
  ): Promise<string> {
    this.logger.log('Generate html: ' + input);

    try {
      const page = await printer.preview(input);

      // remove the pagedjs script so that it doesn't get executed again on the client
      await page.evaluate(() => {
        const scripts = Array.from(
          document.head.querySelectorAll('script'),
        ).filter((script) => !script.hasAttribute('keep'));

        scripts.forEach((script) => script.parentNode.removeChild(script));
      });

      const html = await page.content();

      printer.close();

      return html;
    } catch (error) {
      this.logger.error(error);
      throw new PagedJsException();
    }
  }
}
