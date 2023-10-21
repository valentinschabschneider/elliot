import { get } from 'env-var';

export default () => {
  return {
    cleanupJobAfterCollected: get('CLEANUP_JOB_AFTER_COLLECTED')
      .default('false')
      .asBool(),
  };
};
