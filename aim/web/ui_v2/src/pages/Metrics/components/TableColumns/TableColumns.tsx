import React from 'react';
import { Chip } from '@material-ui/core';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

function getTableColumns(
  paramColumns: string[] = [],
  groupFields?: { [key: string]: string } | null,
  aggregationMethods?: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  },
): ITableColumn[] {
  const columns = [
    {
      key: 'experiment',
      content: 'Experiment',
      topHeader: 'Metrics',
      pin: 'left',
    },
    {
      key: 'run',
      content: 'Run',
      topHeader: 'Metrics',
    },
    {
      key: 'metric',
      content: 'Metric',
      topHeader: 'Metrics',
    },
    {
      key: 'context',
      content: 'Context',
      topHeader: 'Metrics',
    },
    {
      key: 'value',
      content: 'Value',
      topHeader: 'Metrics',
    },
    {
      key: 'step',
      content: 'Step',
      topHeader: 'Metrics',
    },
    {
      key: 'epoch',
      content: 'Epoch',
      topHeader: 'Metrics',
    },
    {
      key: 'timestamp',
      content: 'Time',
      topHeader: 'Metrics',
    },
  ].concat(
    paramColumns.map((param) => ({
      key: param,
      content: param,
      topHeader: 'Params',
    })),
  );

  if (groupFields) {
    Object.keys(groupFields).forEach((field) => {
      const key = field.replace('run.params.', '');
      const column = columns.find((col) => col.key === key);
      if (!!column) {
        column.pin = 'left';
      }
    });
    columns.sort((a, b) => {
      if (a.key === '#') {
        return -1;
      } else if (
        groupFields.hasOwnProperty(a.key) ||
        groupFields.hasOwnProperty(`run.params.${a.key}`)
      ) {
        return -1;
      }
      return 0;
    });
  }

  return !!groupFields
    ? [
        {
          key: '#',
          content: '#',
          topHeader: 'Grouping',
          pin: 'left',
        } as ITableColumn,
      ].concat(columns)
    : columns;
}

export default getTableColumns;
