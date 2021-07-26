// @ts-nocheck

import { isEqual } from 'lodash-es';
import struct from '@aksel/structjs';

const PATH_SENTINEL = 0xfe;
const SIZE_T = 'q';

const NONE = 0;
const BOOL = 1;
const INT = 2; // Stored as 64-bit Long Long
const FLOAT = 3; // Stored as 64-bit Double
const STRING = 4;
const BYTES = 5;
const ARRAY = 6;
const OBJECT = 7;

const ArrayFlag = {};
const ObjectFlag = {};

let utf8decoder = new TextDecoder('utf-8');

function decodeNone(buffer: ArrayBuffer) {
  return null;
}

function decodeBool(buffer: ArrayBuffer) {
  return struct('<?').unpack(buffer)[0];
}

function decodeInt(buffer: ArrayBuffer) {
  const len = buffer.byteLength;
  if (len === struct('<q').size) {
    return struct('<q').unpack(buffer)[0];
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

function decodeValue(buffer: Uint8Array) {
  const bufferValue = buffer.slice(1);
  const arrayBuffer = typedArrayToBuffer(bufferValue);
  const typeId = buffer[0];
  debugger;

  return decodeByType(typeId as number, arrayBuffer);
}

function decode_q_be(...x: number[]) {
  return (
    x[0] * (1 << 56) +
    x[1] * (1 << 48) +
    x[2] * (1 << 40) +
    x[3] * (1 << 32) +
    x[4] * (1 << 24) +
    x[5] * (1 << 16) +
    x[6] * (1 << 8) +
    x[7] * (1 << 0)
  );
}

export function decodePath(buffer: Uint8Array) {
  const path = [];
  let key: any;

  let len = buffer.length;

  for (let cursor = 0; cursor < len; cursor++) {
    if (buffer[cursor] === PATH_SENTINEL) {
      let keySize = struct.sizeFor(SIZE_T); // 8
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

function iterFoldTree(pathsVals) {
  const stack = [];
  const path = [];
}

// def iter_fold_tree(
//   paths_vals: Iterator[Tuple[Tuple[Union[int, str], ...], Any]],
//   *,
//   # prefix: Tuple[Tuple[int, str], ...] = (),
//   level: int = 0
// ) -> AimObject:
//   # assert 0 <= level <= 1
//   stack = []
//   # path = list(prefix)
//   path = []

//   # # TODO remove
//   # paths_vals = list(paths_vals)
//   # L = paths_vals

//   paths_vals = iter(paths_vals)
//   try:
//       keys, val = next(paths_vals)
//       # assert not keys
//       if keys:
//           raise StopIteration
//       node = val_to_node(val)
//       stack.append(node)
//   except StopIteration:
//       if level > 0:
//           return
//       else:
//           raise KeyError

//   for keys, val in paths_vals:
//       keys = list(keys)

//       # TODO precalc common path; implement in O(1)
//       while path != keys[:len(path)]:
//           last_state = stack.pop()
//           if len(stack) == level:
//               yield path, last_state
//           path.pop()

//       # while path != keys:
//       #     adding_path = keys[len(path)]
//       #     path.append(adding_path)
//       #     new_state = dict()
//       #     if isinstance(stack[-1], dict):
//       #         stack[-1][adding_path] = new_state
//       #     else:
//       #         stack[-1].append(new_state)
//       #     stack.append(new_state)
//       node = val_to_node(val)

//       assert len(keys) == len(path) + 1
//       key_to_add = keys[-1]
//       path.append(key_to_add)
//       assert stack

//       if isinstance(stack[-1], list):
//           while len(stack[-1]) != key_to_add:
//               stack[-1].append(None)
//           stack[-1].append(node)
//       elif isinstance(stack[-1], dict):
//           stack[-1][key_to_add] = node
//       else:
//           raise ValueError
//       stack.append(node)

//       # # stack.pop()
//       # stack.append(new_state)

//   # while path != keys[:len(path)]:
//   #     last_state = stack.pop()
//   #     if len(stack) == level:
//   #         yield path, last_state
//   #     path.pop()

//   # if level == 0:
//   #     yield (), stack[0]

//   if level < len(stack):
//       yield tuple(path[:level]), stack[level]
//   # return stack[0]

// def fold_tree(
//   paths_vals: Iterator[Tuple[Tuple[Union[int, str], ...], Any]],
//   # prefix: Tuple[Tuple[int, str], ...] = ()
// ) -> AimObject:
//   (keys, val), = iter_fold_tree(paths_vals,
//                                       # prefix=prefix,
//                                       level=0)
//   # TODO raise KeyError here
//   return val

function decodePathsVals(pathsVals: [Uint8Array, Uint8Array][]) {
  const currentPath = [];
  const result = [[undefined, ObjectFlag]];

  for (let [encodedPath, encodedVal] of pathsVals) {
    let path = decodePath(encodedPath);
    let val = decodeValue(encodedVal);

    while (!isEqual(path.slice(0, currentPath.length), currentPath)) {
      currentPath.pop();
    }

    while (!isEqual(currentPath, path)) {
      currentPath.push(path[currentPath.length] as any);
      if (!isEqual(currentPath, path)) {
        result.push([currentPath, ObjectFlag]);
      }
    }

    result.push(path, val);
  }

  return result;
}

// function decodeTree(pathsVals) {
//   return foldTree(decodePathsVals(pathsVals));
// }
