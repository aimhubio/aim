export default function getFilteredRow<T extends Record<string, any>>(
  columnKeys: string[],
  row: T,
): { [key: string]: string } {
  return columnKeys.reduce((acc: { [key: string]: string }, column: string) => {
    let value = row[column];
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value !== 'string') {
      value = value || value === 0 ? JSON.stringify(value) : '-';
    }

    if (column.startsWith('params.')) {
      acc[column.replace('params.', '')] = value;
    } else {
      acc[column] = value;
    }

    return acc;
  }, {});
}
