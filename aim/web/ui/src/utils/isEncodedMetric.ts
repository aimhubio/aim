import { AIM64_ENCODING_PREFIX, decode } from './encoder/encoder';

export function isEncodedMetric(key: string) {
  return (
    key?.startsWith(AIM64_ENCODING_PREFIX) &&
    JSON.parse(decode(key)).hasOwnProperty('metricName')
  );
}
