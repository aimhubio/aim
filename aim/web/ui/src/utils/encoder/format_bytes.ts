const HEXDIGITS = '0123456789abcdef';

// python 'bytes' representation
export function format_bytes(arr: Uint8Array, quote?: string): string {
  if (!quote) {
    quote = '"';
  }
  let tokens = [];
  tokens.push('b');
  tokens.push(quote);
  for (let c of arr) {
    if (c === quote.charCodeAt(0) || c === 92) {
      tokens.push('\\');
      tokens.push(String.fromCharCode(c));
    } else if (c === 9) {
      tokens.push('\\t');
    } else if (c === 10) {
      tokens.push('\\n');
    } else if (c === 13) {
      tokens.push('\\r');
    } else if (c < 32 || c > 0x7f) {
      tokens.push('\\x');
      tokens.push(HEXDIGITS[(c & 0xf0) >> 4]);
      tokens.push(HEXDIGITS[c & 0x0f]);
    } else {
      tokens.push(String.fromCharCode(c));
    }
  }
  tokens.push(quote);
  return tokens.join('');
}
