import { InternalServerErrorException } from '@nestjs/common';

export class PagedJsException extends InternalServerErrorException {
  constructor(...args: any[]) {
    super(...args);
  }
}
