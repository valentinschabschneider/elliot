import { get } from 'env-var';

export default () => {
  return {
    compressionLevel: get('COMPRESSION_LEVEL').default(0).asInt(),
  };
};
