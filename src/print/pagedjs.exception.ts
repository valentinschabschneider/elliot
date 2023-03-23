import { InternalServerErrorException, HttpStatus } from '@nestjs/common';

export class PagedJsException extends InternalServerErrorException {
  constructor() {
    super('PagedJs Error');
  }
}
