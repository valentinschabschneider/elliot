import { get } from 'env-var';

export default () => {
  return {
    persistPeriod: get('PERSIST_PERIOD')
      .default(3600 * 1000)
      .asInt(),
  };
};
