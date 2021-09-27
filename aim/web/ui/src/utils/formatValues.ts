export function formatValues(value: any, undefinedValue: any = '-') {
  if (value === undefined) {
    return undefinedValue;
  }
  if (value === null) {
    return 'None';
  }
  if (value === true) {
    return 'True';
  }
  if (value === false) {
    return 'False';
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}
