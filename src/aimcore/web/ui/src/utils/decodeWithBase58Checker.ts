import { setItem } from 'utils/storage';

import { AIM64_ENCODING_PREFIX, decode, encode } from './encoder/encoder';

export default function decodeWithBase58Checker({
  value,
  localStorageKey,
}: {
  value: string;
  localStorageKey?: string;
}) {
  const decodedValue: string = decode(value);
  if (!value.startsWith(AIM64_ENCODING_PREFIX)) {
    const encodedValue: string = encode(JSON.parse(decodedValue));
    if (localStorageKey) {
      setItem(localStorageKey, encodedValue);
    }
  }

  return decodedValue;
}
