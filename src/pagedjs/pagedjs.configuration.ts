import { get } from 'env-var';

export default () => {
  const isProduction = get('NODE_ENV').required().asString() == 'production';

  return {
    browserEndpoint: get('BROWSERLESS_ENDPOINT').asString(),
    maxTimeout: get('MAX_TIMEOUT').required(isProduction).asIntPositive(),
    debug: get('DEBUG').default('false').asBool(),
    additionalStyles: get('ADDITIONAL_STYLES')
      .default('[]')
      .asJsonArray() as string[],
    additionalScripts: get('ADDITIONAL_SCRIPTS')
      .default('[]')
      .asJsonArray() as string[],
    httpHeaders: get('HTTP_HEADERS').default('[]').asJsonArray() as Record<
      string,
      string
    >[],
  };
};
