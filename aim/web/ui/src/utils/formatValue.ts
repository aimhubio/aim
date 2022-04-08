import { bytes__repr__ } from './encoder/bytes_repr';

export function formatValue(value: any, undefinedValue: any = '-'): any {
  let formatted = replacer(value, undefinedValue);

  // stringify 'object' type
  if (typeof formatted === 'object') {
    formatted = JSON.stringify(formatted, (key, node) => {
      if (typeof node === 'string') {
        // remove double-strings from 'node'
        return node.replaceAll('"', '');
      }
      return node;
    });
  }
  console.log('value: ', value, 'formatted: ', formatted);
  return formatString(formatted);
}

function replacer(value: any, undefinedValue: any = '-'): any {
  switch (typeof value) {
    case 'number':
      if (isNaN(value)) {
        return 'NaN';
      }
      if (!isFinite(value)) {
        return value === Infinity ? 'Inf' : '-Inf';
      }
      return formatNumber(value);
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'True' : 'False';
    case 'undefined':
      return undefinedValue;
    case 'object':
      if (value === null) {
        return 'None';
      } else if (value instanceof ArrayBuffer) {
        return bytes__repr__(new Uint8Array(value), "'");
      } else if (Array.isArray(value)) {
        const arr = [];
        for (let v of [...value]) {
          arr.push(replacer(v, undefinedValue));
        }
        return arr;
      } else {
        const obj: Record<string, unknown> = {};
        for (let key of Object.keys({ ...value })) {
          obj[key] = replacer(value[key], undefinedValue);
        }
        return obj;
      }
    default:
      return value;
  }
}

// TODO: implement proper formatting for numeric values
function formatNumber(value: number): number {
  return value;
}

const formatsToReplace: [string, string][] = [
  ['"True"', 'True'],
  ['"False"', 'False'],
  ['"NaN"', 'NaN'],
  ['"Inf"', 'Inf'],
  ['"-Inf"', '-Inf'],
];

function formatString(formattedValue: any) {
  if (typeof formattedValue === 'string') {
    formatsToReplace.forEach((f) => {
      formattedValue = formattedValue.replaceAll(f[0], f[1]);
    });
  }
  return formattedValue;
}
