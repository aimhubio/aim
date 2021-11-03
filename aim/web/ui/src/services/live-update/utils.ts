/* eslint-disable no-console */

import API from 'services/api/api';

import { IApiRequest } from 'types/services/services';

const LogTypes = {
  log: 'black',
  error: 'red',
  success: 'green',
};

enum LogTypeNames {
  log = 'log',
  error = 'error',
  success = 'success',
}

export function log(
  message: string | Error | typeof Error,
  type: LogTypeNames = LogTypeNames.log,
): void {
  console.log(`%c ${message}`, `color: ${LogTypes[type]}`);
}

export function invariantSuccess(message: string, condition: boolean): void {
  if (condition) {
    log(message, LogTypeNames.success);
  }
}

export function invariantError(
  exception: string | Error | typeof Error,
  condition: boolean,
): void {
  if (condition) {
    log(exception, LogTypeNames.error);
  }
}

/**
 * function createGetStream
 * Useful to dynamically create {call, abort} methods
 * @param {String} endpoint - uri
 * @param {Object} params - parameters to send with http call
 */
export function createGetStream(
  endpoint: string,
  params: Object,
): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoint, params);
}

/**
 * @internal function arrayBufferToString
 * Converts an ArrayBuffer to a String.
 * @param buffer - Buffer to convert.
 * @returns String.
 */
function arrayBufferToString(buffer: ArrayBuffer): string {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)));
}

/**
 * @internal function stringToArrayBuffer
 * Converts a String to an ArrayBuffer.
 * @param str - String to convert.
 * @returns ArrayBuffer.
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
  const stringLength = str.length;
  const buffer = new ArrayBuffer(stringLength * 2);
  const bufferView = new Uint16Array(buffer);
  for (let i = 0; i < stringLength; i++) {
    bufferView[i] = str.charCodeAt(i);
  }
  return buffer;
}

/**
 * createTransferableData
 * Useful to convert transferable data to non-transferable getting from Worker
 * @param {ArrayBufferLike} data - buffer
 * convert buffer to JSON parse result
 */
export function createTransferableData(data: any): Buffer {
  const stringData = JSON.stringify(data, (k: string, v) => {
    if (k === 'blob') {
      return arrayBufferToString(v);
    }

    return v;
  });

  return Buffer.from(stringData, 'utf-8');
}

/**
 * getDataFromTransferable
 * Useful to convert transferable data to non-transferable getting from Worker
 * @param {ArrayBufferLike} data - buffer
 * convert buffer to JSON parse result
 */
export function getDataFromTransferable(data: ArrayBufferLike): any {
  const view = new DataView(data, 0, data.byteLength);
  const decoder = new TextDecoder('utf-8');
  const string = decoder.decode(view.buffer);

  return JSON.parse(string, (k, v) => {
    if (k === 'blob') {
      return stringToArrayBuffer(v);
    }
    return v;
  });
}
