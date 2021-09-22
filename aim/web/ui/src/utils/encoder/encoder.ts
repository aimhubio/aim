import bs58check from 'bs58check';

export function encode(value: Record<string, unknown>): string {
  return bs58check.encode(Buffer.from(JSON.stringify(value)));
}

export function decode(value: string): string {
  return bs58check.decode(value).toString();
}
