import React from 'react';
import { Chip } from '@material-ui/core';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

function getMetricsTableColumns(
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
      content: <span>Experiment</span>,
      topHeader: 'Metrics',
      pin: 'left',
    },
    {
      key: 'run',
      content: <span>Run</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'metric',
      content: <span>Metric</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'context',
      content: <span>Context</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'value',
      content: <span>Value</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'step',
      content: <span>Step</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'epoch',
      content: <span>Epoch</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'time',
      content: <span>Time</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'actions',
      content: '',
      topHeader: '',
      pin: 'right',
    },
  ].concat(
    paramColumns.map((param) => ({
      key: param,
      content: <span>{param}</span>,
      topHeader: 'Params',
    })),
  );

  if (groupFields) {
    Object.keys(groupFields).forEach((field) => {
      const key = field.replace('run.params.', '');
      const column = columns.find((col) => col.key === key);
      if (!!column) {
        column.pin = 'left';
        column.topHeader = 'Grouping';
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

  return columns;
}

function getMetricsTableRowContent(rowsData: any, groups: boolean) {
  let rowsContent = groups ? {} : [];
}

export { getMetricsTableColumns, getMetricsTableRowContent };
