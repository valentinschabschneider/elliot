import { get } from 'env-var';

export default () => {
  const isProduction = get('NODE_ENV').required().asString() == 'production';

  return {
    apiKey: get('API_KEY').required(isProduction).asString(),
    jwtSecret: get('JWT_SECRET').required(isProduction).asString(),
  };
};
