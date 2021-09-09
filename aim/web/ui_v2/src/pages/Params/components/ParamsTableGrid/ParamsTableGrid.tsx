import * as React from 'react';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

function getParamsTableColumns(
  paramColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
): ITableColumn[] {
  const columns = [
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('experiment')
        ? 'left'
        : order?.middle?.includes('experiment')
        ? null
        : order?.right?.includes('experiment')
        ? 'right'
        : 'left',
    },
    {
      key: 'run',
      content: <span>Run</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.right?.includes('run')
        ? 'right'
        : null,
    },
  ].concat(
    paramColumns.map((param) => ({
      key: param,
      content: <span>{param}</span>,
      topHeader: 'Params',
      pin: order?.left?.includes(param)
        ? 'left'
        : order?.right?.includes(param)
        ? 'right'
        : null,
    })),
  );

  // if (groupFields) {
  //   Object.keys(groupFields).forEach((field) => {
  //     const key = field.replace('run.params.', '');
  //     const column = columns.find((col) => col.key === key);
  //     if (!!column) {
  //       column.pin = 'left';
  //       column.topHeader = 'Grouping';
  //     }
  //   });
  //   columns.sort((a, b) => {
  //     if (a.key === '#') {
  //       return -1;
  //     } else if (
  //       groupFields.hasOwnProperty(a.key) ||
  //       groupFields.hasOwnProperty(`run.params.${a.key}`)
  //     ) {
  //       return -1;
  //     }
  //     return 0;
  //   });
  // }
  if (groupFields) {
    columns.push({
      key: '#',
      //@ts-ignore
      content: '#',
      topHeader: 'Grouping',
      pin: 'left',
    });
    Object.keys(groupFields).forEach((field) => {
      const key = field.replace('run.params.', '');
      const column = columns.find((col) => col.key === key);
      if (!!column) {
        column.pin = 'left';
        column.topHeader = 'Grouping';
      }
    });
  }
  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === '#') {
      return -1;
    } else if (
      groupFields?.hasOwnProperty(a.key) ||
      groupFields?.hasOwnProperty(`run.params.${a.key}`)
    ) {
      return -1;
    } else if (a.key === 'actions') {
      return 1;
    }
    if (!columnsOrder.includes(a.key) && !columnsOrder.includes(b.key)) {
      return 0;
    } else if (!columnsOrder.includes(a.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });
  return columns;
}

export { getParamsTableColumns };
