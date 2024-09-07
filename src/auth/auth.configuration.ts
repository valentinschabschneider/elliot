import { Logger } from '@nestjs/common';
import { get } from 'env-var';

const logger = new Logger('AuthConfiguration');

export default () => {
  const isProduction = get('NODE_ENV').asString() == 'production';

  const apiKey = get('API_KEY').asString();

  if (isProduction && !apiKey) {
    logger.warn('No API_KEY configured!');
  }

  return {
    apiKey,
  };
};
