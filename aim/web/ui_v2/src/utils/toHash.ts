import { encode, decode } from 'bs58check';

export function bufferToString(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

export function contextToHash(context: { [key: string]: any }): string {
  return encode(Buffer.from(JSON.stringify(context)));
}

export function traceToHash(
  runHash: string,
  metricName: string,
  traceContext: { [key: string]: unknown } | string,
): string {
  if (typeof traceContext !== 'string') {
    traceContext = contextToHash(traceContext);
  }

  return encode(Buffer.from(`${runHash}/${metricName}/${traceContext}`));
}
