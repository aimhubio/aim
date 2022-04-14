import { bytes__repr__ } from './encoder/bytes_repr';

const FORMATTERS: Record<string, Function> = {
  undefined: format_undefined,
  number: format_number,
  string: format_string,
  boolean: format_boolean,
  object: format_object,
};

function format_number(value: number): string {
  if (isNaN(value)) {
    return 'NaN';
  }
  if (!isFinite(value)) {
    return value > 0 ? 'Inf' : '-Inf';
  }

  return JSON.stringify(value);
}

function format_string(value: string): string {
  return JSON.stringify(value);
}

function format_boolean(value: boolean): string {
  return value ? 'True' : 'False';
}

function format_array(value: unknown[], undefinedValue: string = '-'): string {
  const pieces = [];
  for (let i = 0; i < value.length; ++i) {
    const piece = formatValue(value[i], undefinedValue);
    pieces.push(piece);
  }
  return '[' + pieces.join(', ') + ']';
}

function format_object(
  value: Record<string, unknown>,
  undefinedValue: string = '-',
): string {
  if (value === null) {
    return 'None';
  } else if (value instanceof ArrayBuffer) {
    return bytes__repr__(new Uint8Array(value), "'");
  } else if (Array.isArray(value)) {
    return format_array(value, undefinedValue);
  } else {
    let objStr = '{';
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
      if (i) {
        objStr += ', ';
      }
      objStr += keys[i] + ': ' + formatValue(value[keys[i]], undefinedValue);
    }
    return objStr + '}';
  }
}

function format_undefined(value: any, undefinedValue: string = '-'): string {
  return undefinedValue;
}

export function formatValue(value: any, undefinedValue: string = '-'): string {
  let formatter = FORMATTERS[typeof value];
  return formatter(value, undefinedValue);
}
