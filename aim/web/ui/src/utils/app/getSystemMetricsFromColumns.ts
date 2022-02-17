import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import { isSystemMetric } from 'utils/isSystemMetric';

/**
 * @param {ITableColumn[]} tableColumns an array of table columns,
 * like `[{
        key: 'Loss_type="duration_loss"',
        content: {
          key: null,
          ref: null,
          props: {
            size: 'small',
            color: '#3E72E7',
            label: 'type="duration_loss"',
          },
        },
        topHeader: 'Loss',
        pin: null,
        isHidden: false,
      },
      {
        key: '__system__cpu',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'CPU (%)',
          },
        },
        topHeader: 'System Metrics',
        pin: null,
        isHidden: true,
      }]`
 * @returns {Array} Array containing system metric keys or empty array
 * @example
 * getSystemMetricsFromColumns([{
        key: 'Loss_type="duration_loss"',
        content: {
          key: null,
          ref: null,
          props: {
            size: 'small',
            color: '#3E72E7',
            label: 'type="duration_loss"',
          },
        },
        topHeader: 'Loss',
        pin: null,
        isHidden: false,
      }, {
        key: '__system__cpu',
        content: {
          type: 'span',
          key: null,
          ref: null,
          props: {
            children: 'CPU (%)',
          },
        },
        topHeader: 'System Metrics',
        pin: null,
        isHidden: true,
      }]); // => ['__system__cpu']
 */

export default function getSystemMetricsFromColumns(
  tableColumns: ITableColumn[],
): string[] | [] {
  let arr: string[] = [];
  tableColumns?.forEach(({ key }) => {
    if (isSystemMetric(key)) {
      arr.push(key);
    }
  });
  return arr;
}
