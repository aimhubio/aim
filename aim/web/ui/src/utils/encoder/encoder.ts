import bs58check from 'bs58check';
import md5 from 'md5';

export function encode(
  value: Record<string, unknown>,
  oneWayHashing?: boolean,
): string {
  return oneWayHashing
    ? md5(JSON.stringify(value))
    : bs58check.encode(Buffer.from(JSON.stringify(value)));
}

export function decode(value: string): string {
  try {
    return bs58check.decode(value).toString();
  } catch (ex) {
    return '{}';
  }
}
