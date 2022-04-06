export function formatValue(value: any, undefinedValue: any = '-') {
  let formattedValue;

  if (typeof value === 'number') {
    formattedValue = replacer(value, undefinedValue);
  } else if (
    value === null ||
    value === undefined ||
    typeof value == 'boolean'
  ) {
    formattedValue = replacer(value, undefinedValue);
  } else {
    formattedValue = JSON.stringify(value, (key, node) =>
      // TODO: remove replacer by implementing custom stringify method
      replacer(node, undefinedValue),
    );

    formattedValue
      .replaceAll('"__None__"', 'None')
      .replaceAll('"__True__"', 'True')
      .replaceAll('"__False__"', 'False')
      .replaceAll('__None__', 'None')
      .replaceAll('__True__', 'True')
      .replaceAll('__False__', 'False');
  }

  return formattedValue;
}

function replacer(value: any, undefinedValue: any = '-') {
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
    if (isNaN(value)) return undefinedValue;
    return formatNumber(value);
  }

  return value;
}

// TODO: implement proper formatting for numeric values
function formatNumber(value: number) {
  return value;
}
