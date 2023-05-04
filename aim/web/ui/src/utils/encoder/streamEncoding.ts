// @ts-nocheck

import { isEqual } from 'lodash-es';

import struct from '@aksel/structjs';

import { IRunProgress } from 'services/api/base-explorer/runsApi';

const PATH_SENTINEL = 0xfe;
// const SIZE_T = 'q';

const NONE = 0;
const BOOL = 1;
const INT = 2; // Stored as 64-bit Long Long
const FLOAT = 3; // Stored as 64-bit Double
const STRING = 4;
const BYTES = 5;
const ARRAY = 6;
const OBJECT = 7;

class AimObjectFlag {
  private flagType: string;
  constructor(flagType: string) {
    this.flagType = flagType;
  }

  toString() {
    return `<${this.flagType}>`;
  }
}
const ArrayFlag = new AimObjectFlag('ARRAY_FLAG');
const ObjectFlag = new AimObjectFlag('OBJECT_FLAG');

let utf8decoder = new TextDecoder('utf-8');

function decodeNone(buffer: ArrayBuffer) {
  return null;
}

function decodeBool(buffer: ArrayBuffer) {
  return struct('<?').unpack_from(buffer.buffer, buffer.byteOffset)[0];
}

function decodeInt(buffer: ArrayBuffer) {
  const len = buffer.byteLength;
  if (len === 8) {
    return decode_q_le(buffer);
  } else if (len === struct('<l').size) {
    return struct('<l').unpack_from(buffer.buffer, buffer.byteOffset)[0];
  } else if (len === struct('<h').size) {
    return struct('<h').unpack_from(buffer.buffer, buffer.byteOffset)[0];
  }
}

function decodeFloat(buffer: ArrayBuffer) {
  const len = buffer.byteLength;
  if (len === struct('<d').size) {
    return struct('<d').unpack_from(buffer.buffer, buffer.byteOffset)[0];
  } else if (len === struct('<f').size) {
    return struct('<f').unpack_from(buffer.buffer, buffer.byteOffset)[0];
  } else if (len === struct('<e').size) {
    return struct('<e').unpack_from(buffer.buffer, buffer.byteOffset)[0];
  }
}

function decodeString(buffer: ArrayBuffer) {
  return utf8decoder.decode(buffer);
}

function decodeBytes(buffer: ArrayBuffer) {
  return buffer;
}

function decodeByType(typeId: number, buffer: ArrayBuffer) {
  let value;
  switch (typeId) {
    case NONE:
      value = decodeNone(buffer);
      break;
    case BOOL:
      value = decodeBool(buffer);
      break;
    case INT:
      value = decodeInt(buffer);
      break;
    case FLOAT:
      value = decodeFloat(buffer);
      break;
    case STRING:
      value = decodeString(buffer);
      break;
    case BYTES:
      value = decodeBytes(buffer);
      break;
    case ARRAY:
      value = ArrayFlag;
      break;
    case OBJECT:
      value = ObjectFlag;
      break;
  }

  return value;
}

function decodeValue(buffer: Uint8Array): any {
  const bufferValue = buffer.subarray(1);
  const typeId = buffer[0];

  return decodeByType(typeId as number, bufferValue);
}

const _2__56 = Math.pow(2, 56);
const _2__48 = Math.pow(2, 48);
const _2__40 = Math.pow(2, 40);
const _2__32 = Math.pow(2, 32);

function decode_q_le(x: number[], offset: number) {
  offset = offset | 0;
  if (
    (x[offset + 6] !== 0 || x[offset + 7] !== 0) &&
    (x[offset + 6] !== 255 || x[offset + 7] !== 255)
  ) {
    // eslint-disable-next-line no-console
    console.log(
      'Potential integer overflow detected. Only 52-bit integers are supported now.',
    );
  }

  if (x[offset + 7] & 128) {
    return ~decode_q_le([
      255 ^ x[offset + 0],
      255 ^ x[offset + 1],
      255 ^ x[offset + 2],
      255 ^ x[offset + 3],
      255 ^ x[offset + 4],
      255 ^ x[offset + 5],
      255 ^ x[offset + 6],
      255 ^ x[offset + 7],
    ]);
  }

  return (
    x[offset + 7] * _2__56 +
    x[offset + 6] * _2__48 +
    x[offset + 5] * _2__40 +
    x[offset + 4] * _2__32 +
    (x[offset + 3] << 24) +
    (x[offset + 2] << 16) +
    (x[offset + 1] << 8) +
    (x[offset + 0] << 0)
  );
}

function decode_q_be(x: number[], offset: number) {
  offset = offset | 0;
  return (
    x[offset + 0] * _2__56 +
    x[offset + 1] * _2__48 +
    x[offset + 2] * _2__40 +
    x[offset + 3] * _2__32 +
    (x[offset + 4] << 24) +
    (x[offset + 5] << 16) +
    (x[offset + 6] << 8) +
    (x[offset + 7] << 0)
  );
}

function splitPath(buffer: Uint8Array) {
  const path = [];
  let len = buffer.length;

  for (let cursor = 0; cursor < len; cursor++) {
    if (buffer[cursor] === PATH_SENTINEL) {
      let keySize = 8; // struct.sizeFor(SIZE_T);
      let key = decode_q_be(buffer, cursor + 1);
      path.push(key);
      cursor += keySize + 1;
    } else {
      let start = cursor;
      while (cursor < buffer.length && buffer[cursor++] !== PATH_SENTINEL);
      let keyBuffer = buffer.subarray(start, --cursor);
      path.push(keyBuffer);
    }
  }
  return path;
}

type AimObjectPrimitive = null | boolean | number | string | ArrayBuffer;
type AimObjectArray = AimObject[];
type AimObjectDict = { [key: string]: AimObject };
type AimObjectNode = AimObjectDict | AimObjectArray;

type AimObject = AimObjectPrimitive | AimObjectNode;

type AimObjectKey = string | number;
type AimObjectPath = AimObjectKey[];

function valToNode(val: AimObjectPrimitive | AimObjectFlag): AimObject {
  if (val instanceof AimObjectFlag) {
    if (val === ObjectFlag) {
      return {};
    }
    if (val === ArrayFlag) {
      return [];
    }

    throw new TypeError('Not implemented flag');
  }

  return val;
}

export async function* iterFoldTree(
  pathsVals: AsyncGenerator<
    [AimObjectPath, AimObjectPrimitive | AimObjectFlag][]
  >,
  level: number = 0,
): AsyncGenerator<[AimObjectPath, AimObject | undefined]> {
  const stack: AimObject[] = [];
  const path: AimObjectPath = [];

  let item: IteratorResult<
    [AimObjectPath, AimObjectPrimitive | AimObjectFlag],
    void
  >;

  item = await pathsVals.next();
  if (item.done) {
    if (level > 0) {
      return;
    }

    yield [[], undefined];
    return;
  }
  let first_records = item.value;
  if (!first_records.length) {
    if (level > 0) {
      return;
    }
    yield [[], undefined];
    return;
  }
  let [keys, val] = first_records.shift();
  if (keys.length) {
    return;
  }

  let node = valToNode(val);
  stack.push(node);
  for await (let records of pathsVals) {
    if (first_records.length) {
      records = [...first_records, ...records];
      first_records = [];
    }
    for (let [keys, val] of records) {
      while (!isEqual(path, keys.slice(0, path.length))) {
        let lastState = stack.pop();
        if (stack.length === level) {
          yield [path.slice(), lastState];
        }
        path.pop();
      }

      node = valToNode(val);

      if (keys.length !== path.length + 1) {
        throw new Error('Assertion Error');
      }
      let keyToAdd: AimObjectKey = keys[keys.length - 1];
      path.push(keyToAdd);

      if (stack.length === 0) {
        throw new Error('Assertion Error');
      }

      let lastState = stack[stack.length - 1] as AimObjectNode;

      if (Array.isArray(lastState)) {
        while (lastState.length !== (keyToAdd as number)) {
          lastState.push(null);
        }
        lastState.push(node);
      } else {
        lastState[keyToAdd] = node;
      }

      stack.push(node);
    }
  }
  if (level < stack.length) {
    yield [path.slice(0, level), stack[level]];
  }
}

export async function* decodeBufferPairs(
  stream: ReadableStream,
): AsyncGenerator<[Uint8Array, Uint8Array][]> {
  let buffer = new Uint8Array(new ArrayBuffer());
  let reader = stream.getReader();

  let p = reader.read();

  function merge(a, b) {
    const mergedArray = new Uint8Array(a.length + b.length);
    mergedArray.set(a);
    mergedArray.set(b, a.length);
    return mergedArray;
  }

  function needs_async_fetch(requested_size) {
    return requested_size > buffer.byteLength;
  }

  async function do_async_fetch(requested_size) {
    // get value and ask to fetch next chunk in background
    let item = await p;
    if (item.done) {
      return false;
    }
    p = reader.read();
    let chunk = item.value;
    buffer = merge(buffer, chunk);
    return true;
  }

  function get_next(requested_size) {
    let response = buffer.subarray(0, requested_size);
    buffer = buffer.subarray(requested_size);
    return response;
  }

  let item;
  let records = [];
  let done = false;

  asyncLoop: while (true) {
    let record = [null, null];
    for (let idx of [0, 1]) {
      while (needs_async_fetch(4) && !done) {
        let promise = do_async_fetch(4);
        yield records;
        records = [];
        done = !(await promise);
      }
      if (done) {
        break asyncLoop;
      }
      item = get_next(4);

      let buffer_len =
        (item[0] << 0) + (item[1] << 8) + (item[2] << 16) + (item[3] << 24);

      while (needs_async_fetch(buffer_len) && !done) {
        let promise = do_async_fetch(buffer_len);
        yield records;
        records = [];
        done = !(await promise);
      }
      if (done) {
        throw new Error('Corrupted stream');
      }
      item = get_next(buffer_len);
      record[idx] = item;
    }
    records.push(record);
  }
  yield records;
}

function areEqual(a, b) {
  if (Number.isInteger(a)) {
    if (Number.isInteger(b)) {
      return a === b;
    } else {
      return false;
    }
  } else {
    if (Number.isInteger(a)) {
      return false;
    }
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function decodePiece(piece) {
  if (Number.isInteger(piece)) {
    return piece;
  }
  return decodeString(piece);
}

export async function* decodePathsVals(
  pathsVals: AsyncGenerator<[Uint8Array, Uint8Array][]>,
): AsyncGenerator<[AimObjectPath, AimObjectPrimitive | AimObjectFlag][]> {
  let pieces_state = null;
  let path_state = null;
  for await (let records of pathsVals) {
    let to_yield = [];
    for (let [encodedPath, encodedVal] of records) {
      let pieces = splitPath(encodedPath);
      let val = decodeValue(encodedVal);
      if (pieces_state === null) {
        if (pieces.length) {
          to_yield.push([[], ObjectFlag]);
        }
        pieces_state = [];
        path_state = [];
      }
      let prefix_len;
      for (
        prefix_len = 0;
        prefix_len < pieces.length && prefix_len < pieces_state.length;
        ++prefix_len
      ) {
        if (!areEqual(pieces[prefix_len], pieces_state[prefix_len])) {
          break;
        }
      }
      while (pieces_state.length > prefix_len) {
        path_state.pop();
        pieces_state.pop();
      }
      while (pieces_state.length !== pieces.length) {
        let piece = pieces[pieces_state.length];
        pieces_state.push(piece);
        let key = decodePiece(piece);
        path_state.push(key);
        if (pieces_state.length !== pieces.length) {
          to_yield.push([[...path_state], ObjectFlag]);
        }
      }
      to_yield.push([[...path_state], val]);
    }
    if (to_yield.length) {
      yield to_yield;
    }
  }
  yield [];
}

/**
 * async function parseStream
 * This function uses 3 core functions to decode storage data
 *  decodeBufferPairs
 *  decodePathsVals
 *  iterFoldTree
 * Receives generic T type to indicate the returned data type
 * @param stream
 * @param options - the callback functions to send streaming progress
 */
export async function parseStream<T extends Array>(
  stream: ReadableStream,
  options?: {
    progressCallback?: (progress: IRunProgress) => void | null;
    callback?: (item: any) => void;
    dataProcessor?: (keys: any, value: any) => any;
  },
): Promise<T> {
  let buffer_pairs = decodeBufferPairs(stream);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);
  if (options?.dataProcessor) {
    return options.dataProcessor(objects);
  } else {
    const data: T = [];

    try {
      for await (let [keys, val] of objects) {
        const object: T = { ...(val as any), hash: keys[0] };
        if (object.hash?.startsWith?.('progress')) {
          // maybe typeof progressCallback === 'function'
          if (options?.progressCallback) {
            options.progressCallback(object as IRunProgress);
            const { 0: checked, 1: trackedRuns } = object;

            options.progressCallback({
              matched: data.length,
              checked,
              trackedRuns,
            });
          }
        } else {
          if (options?.callback) {
            options.callback({ value: val, hash: keys[0] });
          }
          data.push(object);
        }
      }
    } catch (e) {
      // if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error(e);
      // }
      throw e;
    }

    return data;
  }
}
