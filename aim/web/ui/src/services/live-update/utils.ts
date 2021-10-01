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

export function createTransferableData(data: any): Buffer {
  // @TODO resolve issue
  // console.log(data[0].traces[0].values);
  const stringData = data.toString();
  // If the object has nested buffers, it can not convert using stringify, it can not stringify nested buffers
  // console.log(JSON.parse(stringData)[0].traces[0].values);
  // change to array buffer
  const b = Buffer.from(stringData);

  return b;
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
  return JSON.parse(string);
}
