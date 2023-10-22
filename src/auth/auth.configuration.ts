import { Logger } from '@nestjs/common';
import { get } from 'env-var';

const logger = new Logger('AuthConfiguration');

export default () => {
  const isProduction = get('NODE_ENV').required().asString() == 'production';

  const secretKey = get('SECRET_KEY').asString();

  if (isProduction && !secretKey) {
    logger.warn('No SECRET_KEY configured in production mode!');
  }

  return {
    secretKey,
  };
};
