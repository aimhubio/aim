import { decode } from 'utils/encoder/encoder';
import { isEncodedMetric } from 'utils/isEncodedMetric';

export default function getFilteredRow<R extends Record<string, any>>({
  columnKeys,
  row,
}: {
  columnKeys: string[];
  row: R;
}): { [key: string]: string } {
  return columnKeys.reduce((acc: { [key: string]: string }, column: string) => {
    let columnKey = column;
    if (isEncodedMetric(column)) {
      const { metricName, contextName } = JSON.parse(decode(column));
      columnKey = `${metricName}${contextName ? `${contextName} ` : ''}`;
    }
    let value = row[column];
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value !== 'string') {
      value = value || value === 0 ? JSON.stringify(value) : '-';
    }

    if (columnKey.startsWith('params.')) {
      acc[columnKey.replace('params.', '')] = value;
    } else {
      acc[columnKey] = value;
    }

    return acc;
  }, {});
}
