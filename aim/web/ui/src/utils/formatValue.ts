export function formatValue(value: any, undefinedValue: any = '-') {
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
  if (typeof value === 'number') {
    return value;
  }

  return JSON.stringify(value);
}
