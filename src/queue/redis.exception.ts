import { PreconditionFailedException } from '@nestjs/common';

export class RedisNotConfiguredException extends PreconditionFailedException {
  constructor(...args: any[]) {
    super(...args);
  }
}
