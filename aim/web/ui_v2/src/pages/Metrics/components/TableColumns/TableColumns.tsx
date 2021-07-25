import React from 'react';
import { Chip } from '@material-ui/core';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

function getTableColumns(paramColumns: string[] = []): ITableColumn[] {
  return [
    {
      dataKey: 'experiment',
      frozen: 'left',
      key: 'experiment',
      title: 'Experiment',
      width: 150,
      resizable: true,
    },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
      width: 150,
    },
    {
      dataKey: 'metric',
      key: 'metric',
      title: 'Metric',
      width: 150,
    },
    {
      dataKey: 'context',
      key: 'context',
      title: 'Context',
      cellRenderer: (data: any) =>
        (data.cellData as string[]).map((c, i) => (
          <Chip
            key={i}
            variant='outlined'
            color='primary'
            label={c}
            size='small'
          />
        )),
      width: 150,
    },
    {
      dataKey: 'value',
      key: 'value',
      title: 'Value',
      width: 150,
    },
    {
      dataKey: 'iteration',
      key: 'iteration',
      title: 'Iteration',
      width: 150,
    },
  ].concat(
    paramColumns.map((param) => ({
      dataKey: param,
      key: param,
      title: param,
      width: 150,
    })),
  );
}

export default getTableColumns;
