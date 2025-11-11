import { get } from 'env-var';

export default () => {
  return {
    browserEndpoint: get('BROWSERLESS_ENDPOINT').asString(),
    maxTimeout: get('MAX_TIMEOUT')
      .default(10 * 1000)
      .asIntPositive(),
    debug: get('DEBUG').default('false').asBool(),
    additionalScripts: get('ADDITIONAL_SCRIPTS')
      .default('[]')
      .asJsonArray() as string[],
    httpHeaders: get('HTTP_HEADERS').default('{}').asJsonObject() as Record<
      string,
      string
    >,
  };
};
