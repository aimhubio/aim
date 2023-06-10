import bs58check from 'bs58check';
import md5 from 'md5';

const BS64_REPLACE_CHARACTERS = {
  ENCODING: [
    { searchValue: '=', replaceValue: '' },
    { searchValue: '+', replaceValue: '-' },
    { searchValue: '/', replaceValue: '_' },
  ],
  DECODING: [
    { searchValue: '_', replaceValue: '/' },
    { searchValue: '-', replaceValue: '+' },
  ],
};
// replace URL and CSS selectors, vulnerable characters '+', '/', '=',

const BS64_ENCODING_PADDING = ['', '===', '==', '='];

export const AIM64_ENCODING_PREFIX = 'O-';
// `O` - is a character which cannot exist in the base58-encoded data,
// ability to resolve backward compatibility issue

export function aim64encode(value: Record<string, unknown>) {
  const json_encoded = JSON.stringify(value);
  let aim64_encoded = btoa(encodeURI(json_encoded));
  for (let { searchValue, replaceValue } of BS64_REPLACE_CHARACTERS.ENCODING) {
    aim64_encoded = aim64_encoded.replaceAll(searchValue, replaceValue);
  }
  return AIM64_ENCODING_PREFIX + aim64_encoded;
}

export function aim64decode(aim64_encoded: string) {
  if (!aim64_encoded.startsWith(AIM64_ENCODING_PREFIX)) {
    throw Error('Aim64 encoding magic bytes not found!');
  }
  let bs64_encoded = aim64_encoded.slice(2);
  for (let { searchValue, replaceValue } of BS64_REPLACE_CHARACTERS.DECODING) {
    bs64_encoded = bs64_encoded.replaceAll(searchValue, replaceValue);
  }
  // add padding `=` characters back to make the encoded string length a multiple of 4
  bs64_encoded += BS64_ENCODING_PADDING[bs64_encoded.length % 4];
  return decodeURI(atob(bs64_encoded));
}

export function encode(
  value: Record<string, unknown>,
  oneWayHashing?: boolean,
): string {
  if (oneWayHashing) {
    return md5(JSON.stringify(value));
  }
  return aim64encode(value);
}

export function decode(value: string): string {
  try {
    if (value.startsWith(AIM64_ENCODING_PREFIX)) {
      return aim64decode(value);
    }
    // `base58Decoded` version for backward compatibility
    return bs58check.decode(value)?.toString();
  } catch (ex) {
    return '{}';
  }
}
