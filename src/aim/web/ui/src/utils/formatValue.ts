import { format_bytes } from './encoder/format_bytes';

const NUMBER_PRECISION = 8;
const UNDEFINED_VALUE = '--';

const FORMATTERS: Record<string, Function> = {
  undefined: format_undefined,
  number: format_number,
  string: format_str,
  boolean: format_bool,
  object: format_object,
};

function format_undefined(
  value: undefined,
  undefinedValue: string = UNDEFINED_VALUE,
): string {
  return undefinedValue;
}

function format_number(value: number): string {
  if (isNaN(value)) {
    return 'NaN';
  }
  if (!isFinite(value)) {
    return value > 0 ? 'Inf' : '-Inf';
  }

  return JSON.stringify(parseFloat(value.toFixed(NUMBER_PRECISION)));
}

function format_str(value: string): string {
  return JSON.stringify(value);
}

function format_bool(value: boolean): string {
  return value ? 'True' : 'False';
}

function format_list(
  value: unknown[],
  undefinedValue: string = UNDEFINED_VALUE,
): string {
  const pieces = [];
  for (let i = 0; i < value.length; i++) {
    const piece = formatValue(value[i], undefinedValue);
    pieces.push(piece);
  }
  return '[' + pieces.join(', ') + ']';
}

function format_dict(
  value: Record<string, unknown>,
  undefinedValue: string = UNDEFINED_VALUE,
): string {
  const pieces = [];
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    const piece = `${format_str(keys[i])}: ${formatValue(
      value[keys[i]],
      undefinedValue,
    )}`;
    pieces.push(piece);
  }
  return '{' + pieces.join(', ') + '}';
}

function format_object(
  value: Record<string, unknown>,
  undefinedValue: string = UNDEFINED_VALUE,
): string {
  if (value === null) {
    return 'None';
  } else if (value instanceof ArrayBuffer) {
    return format_bytes(new Uint8Array(value), "'");
  } else if (Array.isArray(value)) {
    return format_list(value, undefinedValue);
  } else {
    return format_dict(value, undefinedValue);
  }
}

export function formatValue(
  value: unknown,
  undefinedValue: string = UNDEFINED_VALUE,
): string {
  let formatter = FORMATTERS[typeof value];
  return formatter(value, undefinedValue);
}
