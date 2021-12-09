import * as React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { merge } from 'lodash-es';

import { Link } from '@material-ui/core';

import { Badge } from 'components/kit';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

function getRunsTableColumns(
  metricsColumns: any,
  runColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Runs',
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
      topHeader: 'Runs',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.middle?.includes('run')
        ? null
        : order?.right?.includes('run')
        ? 'right'
        : 'left',
    },
  ].concat(
    Object.keys(metricsColumns).reduce((acc: any, key: string) => {
      const systemMetric: boolean = isSystemMetric(key);
      acc = [
        ...acc,
        ...Object.keys(metricsColumns[key]).map((metricContext) => ({
          key: `${systemMetric ? key : `${key}_${metricContext}`}`,
          content: isSystemMetric(key) ? (
            <span>{formatSystemMetricName(key)}</span>
          ) : (
            <Badge
              size='small'
              color={COLORS[0][0]}
              label={metricContext === '' ? 'No context' : metricContext}
            />
          ),
          topHeader: isSystemMetric(key) ? 'System Metrics' : key,
          pin: order?.left?.includes(`${key}_${metricContext}`)
            ? 'left'
            : order?.right?.includes(`${key}_${metricContext}`)
            ? 'right'
            : null,
        })),
      ];
      return acc;
    }, []),
    runColumns.map((param) => ({
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

  columns = columns.map((col) => ({
    ...col,
    isHidden: hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === 'actions') {
      return 1;
    }
    if (!columnsOrder.includes(a.key) && !columnsOrder.includes(b.key)) {
      return 0;
    } else if (!columnsOrder.includes(a.key)) {
      return 1;
    } else if (!columnsOrder.includes(b.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });

  return columns;
}

function runsTableRowRenderer(
  rowData: any,
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (Array.isArray(rowData[col])) {
        row[col] = {
          content: (
            <Badge
              size='small'
              color={COLORS[0][0]}
              label={`${rowData[col].length} values`}
            />
          ),
        };
      }
    }

    return merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData.experiment,
      run: {
        content: (
          <Link
            to={PathEnum.Run_Detail.replace(':runHash', rowData.runHash)}
            component={RouteLink}
          >
            {rowData.run}
          </Link>
        ),
      },
      actions: {
        content: null,
      },
    };

    return merge({}, rowData, row);
  }
}

export { getRunsTableColumns, runsTableRowRenderer };
