export function formatValue(value: any, undefinedValue: any = '-') {
  let formattedValue;
  if (value === null || value === undefined) {
    formattedValue = replacer(value);
  } else {
    formattedValue = JSON.stringify(value, (key, node) =>
      // TODO: remove replacer by implementing custom stringify method
      replacer(node, undefinedValue),
    );
  }
  return formattedValue
    .replaceAll('__None__', 'None')
    .replaceAll('__True__', 'True')
    .replaceAll('__False__', 'False');
}

function replacer(value: any, undefinedValue: any = '-') {
  if (value === undefined) {
    return undefinedValue;
  }
  if (value === null) {
    return '__None__';
  }
  if (value === true) {
    return '__True__';
  }
  if (value === false) {
    return '__False__';
  }
  if (typeof value === 'number') {
    return formatNumber(value);
  }

  return value;
}

// TODO: implement proper formatting for numeric values
function formatNumber(value: number) {
  return value;
}
