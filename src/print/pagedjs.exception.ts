import { InternalServerErrorException } from '@nestjs/common';

export class PagedJsException extends InternalServerErrorException {
  constructor() {
    super('PagedJs Error');
  }
}
