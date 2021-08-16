// @ts-nocheck

import { isEqual } from 'lodash-es';
import struct from '@aksel/structjs';

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
  return struct('<?').unpack(buffer)[0];
}

function decodeInt(buffer: ArrayBuffer) {
  const len = buffer.byteLength;
  if (len === 8) {
    return decode_q_le(...new Uint8Array(buffer));
  } else if (len === struct('<l').size) {
    return struct('<l').unpack(buffer)[0];
  } else if (len === struct('<h').size) {
    return struct('<h').unpack(buffer)[0];
  }
}

function decodeFloat(buffer: ArrayBuffer) {
  const len = buffer.byteLength;
  if (len === struct('<d').size) {
    return struct('<d').unpack(buffer)[0];
  } else if (len === struct('<f').size) {
    return struct('<f').unpack(buffer)[0];
  } else if (len === struct('<e').size) {
    return struct('<e').unpack(buffer)[0];
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

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset,
  );
}

function decodeValue(buffer: Uint8Array): any {
  const bufferValue = buffer.slice(1);
  const arrayBuffer = typedArrayToBuffer(bufferValue);
  const typeId = buffer[0];

  return decodeByType(typeId as number, arrayBuffer);
}

function decode_q_le(...x: number[]) {
  return (
    x[7] * Math.pow(2, 56) +
    x[6] * Math.pow(2, 48) +
    x[5] * Math.pow(2, 40) +
    x[4] * Math.pow(2, 32) +
    x[3] * (1 << 24) +
    x[2] * (1 << 16) +
    x[1] * (1 << 8) +
    x[0] * (1 << 0)
  );
}

function decode_q_be(...x: number[]) {
  return (
    x[0] * Math.pow(2, 56) +
    x[1] * Math.pow(2, 48) +
    x[2] * Math.pow(2, 40) +
    x[3] * Math.pow(2, 32) +
    x[4] * (1 << 24) +
    x[5] * (1 << 16) +
    x[6] * (1 << 8) +
    x[7] * (1 << 0)
  );
}

function decodePath(buffer: Uint8Array): (string | number)[] {
  const path = [];
  let key: string | number;

  let len = buffer.length;

  for (let cursor = 0; cursor < len; cursor++) {
    if (buffer[cursor] === PATH_SENTINEL) {
      let keySize = 8; // struct.sizeFor(SIZE_T);
      key = decode_q_be(...buffer.slice(cursor + 1, cursor + keySize + 1));
      cursor += keySize + 1;
    } else {
      const index = buffer.indexOf(PATH_SENTINEL, cursor);
      let keyBuffer = buffer.buffer.slice(
        buffer.byteOffset + cursor,
        buffer.byteOffset + index,
      );
      key = decodeString(keyBuffer);
      cursor = index;
    }
    path.push(key);
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
    [AimObjectPath, AimObjectPrimitive | AimObjectFlag]
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

  let [keys, val] = item.value;

  if (keys.length) {
    return;
  }

  let node = valToNode(val);
  stack.push(node);

  for await (let [keys, val] of pathsVals) {
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

  if (level < stack.length) {
    yield [path.slice(0, level), stack[level]];
  }
}

export async function* adjustable_reader(
  stream: ReadableStream,
): AsyncGenerator<Uint8Array, void, number> {
  // @ts-ignore
  let buffer = new Uint8Array(new ArrayBuffer(yield));
  let cursor = 0;
  let reader = stream.getReader();
  let done = false;
  let p = reader.read();
  while (true) {
    let item = await p;
    p = reader.read();
    done = item.done;
    if (done) {
      break;
    }
    let chunk = item.value;
    while (chunk.byteLength > 0) {
      if (cursor + chunk.byteLength >= buffer.byteLength) {
        let to_buffer = chunk.subarray(0, buffer.byteLength - cursor);
        buffer.set(to_buffer, cursor);
        chunk = chunk.subarray(buffer.byteLength - cursor);
        buffer = new Uint8Array(new ArrayBuffer(yield buffer));
        cursor = 0;
      } else {
        buffer.set(chunk, cursor);
        cursor += chunk.byteLength;
        break;
      }
    }
  }
  if (cursor !== 0) {
    throw new RangeError('Can not read given number of bytes. EOF');
  }
}

export async function* decode_buffer_pairs(
  async_generator: AsyncGenerator<Uint8Array, void, number>,
): AsyncGenerator<[Uint8Array, Uint8Array]> {
  let item: IteratorResult<Uint8Array, void>;
  await async_generator.next();
  while (true) {
    item = await async_generator.next(4);
    if (item.done) {
      break;
    }

    let key_buffer_len =
      (item.value[0] << 0) +
      (item.value[1] << 8) +
      (item.value[2] << 16) +
      (item.value[3] << 24);
    item = await async_generator.next(key_buffer_len);
    if (item.done) {
      throw new Error('Corrupted stream');
    }

    let key_buffer = item.value;

    item = await async_generator.next(4);
    if (item.done) {
      throw new Error('Corrupted stream');
    }

    let val_buffer_len =
      (item.value[0] << 0) +
      (item.value[1] << 8) +
      (item.value[2] << 16) +
      (item.value[3] << 24);

    item = await async_generator.next(val_buffer_len);
    if (item.done) {
      throw new Error('Corrupted stream');
    }

    let value_buffer = item.value;

    yield [key_buffer, value_buffer];
  }
}

export async function* decodePathsVals(
  pathsVals: AsyncGenerator<[Uint8Array, Uint8Array]>,
): AsyncGenerator<[AimObjectPath, AimObjectPrimitive | AimObjectFlag]> {
  let currentPath: AimObjectPath | null = null;

  for await (let [encodedPath, encodedVal] of pathsVals) {
    let path: AimObjectPath = decodePath(encodedPath);
    let val: AimObjectPrimitive = decodeValue(encodedVal);

    if (currentPath === null) {
      if (path.length) {
        yield [[], ObjectFlag];
      }
      currentPath = [];
    }

    while (!isEqual(path.slice(0, currentPath.length), currentPath)) {
      currentPath.pop();
    }

    while (!isEqual(currentPath, path)) {
      currentPath.push(path[currentPath.length]);
      if (!isEqual(currentPath, path)) {
        yield [currentPath, ObjectFlag];
      }
    }

    yield [path, val];
  }
}
