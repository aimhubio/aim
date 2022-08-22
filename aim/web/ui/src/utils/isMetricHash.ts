import { AIM64_ENCODING_PREFIX, decode } from './encoder/encoder';

export function isMetricHash(key: string) {
  return (
    key?.startsWith(AIM64_ENCODING_PREFIX) &&
    JSON.parse(decode(key)).hasOwnProperty('metricName')
  );
}
