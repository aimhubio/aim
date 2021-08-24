import React from 'react';
import { Chip } from '@material-ui/core';
import _ from 'lodash-es';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

function getTableColumns(
  paramColumns: string[] = [],
  grouped = false,
): ITableColumn[] {
  const columns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 150,
      minWidth: 90,
      resizable: true,
      frozen: 'left',
    },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
      width: 150,
      minWidth: 90,
      resizable: true,
    },
    {
      dataKey: 'metric',
      key: 'metric',
      title: 'Metric',
      width: 150,
      resizable: true,
    },
    {
      dataKey: 'context',
      key: 'context',
      title: 'Context',
      cellRenderer: ({ cellData, rowData }: any) =>
        rowData.groupHeader
          ? cellData
          : (cellData as string[]).map((c, i) => (
              <Chip
                key={i}
                variant='outlined'
                color='primary'
                label={c}
                size='small'
              />
            )),
      width: 150,
      resizable: true,
    },
    {
      dataKey: 'value',
      key: 'value',
      title: 'Value',
      width: 150,
      resizable: true,
    },
    {
      dataKey: 'step',
      key: 'step',
      title: 'Step',
      width: 150,
    },
    {
      dataKey: 'epoch',
      key: 'epoch',
      title: 'Epoch',
      width: 150,
    },
    {
      dataKey: 'timestamp',
      key: 'timestamp',
      title: 'Time',
      width: 150,
      resizable: true,
    },
  ].concat(
    paramColumns.map((param) => ({
      dataKey: param,
      key: param,
      title: param,
      cellRenderer: ({ rowData }: any) =>
        typeof rowData[param] === 'object'
          ? JSON.stringify(rowData[param])
          : rowData[param],
      width: 150,
      resizable: true,
    })),
  );

  return grouped
    ? [
        {
          dataKey: '#',
          key: '#',
          title: '#',
          width: 100,
          frozen: 'left',
        } as ITableColumn,
      ].concat(columns)
    : columns;
}

export default getTableColumns;
