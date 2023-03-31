import { get } from 'env-var';

export default () => {
  const isProduction = get('NODE_ENV').required().asString() == 'production';

  return {
    secretKey: get('SECRET_KEY').required(isProduction).asString(),
  };
};
