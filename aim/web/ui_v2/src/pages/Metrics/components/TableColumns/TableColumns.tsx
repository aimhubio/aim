import React from 'react';
import { Chip } from '@material-ui/core';
import _ from 'lodash-es';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

function getTableColumns(paramColumns: string[] = []): ITableColumn[] {
  return [
    // {
    //   dataKey: 'experiment',
    //   key: 'experiment',
    //   title: 'Experiment',
    //   width: 150,
    //   resizable: true,
    //   frozen: 'left',
    // },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
      width: 150,
      resizable: true,
      frozen: 'left',
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
      cellRenderer: ({ cellData }: any) =>
        (cellData as string[]).map((c, i) => (
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
      cellRenderer: ({ rowData }: any) => rowData[param],
      width: 150,
    })),
  );
}

export default getTableColumns;
