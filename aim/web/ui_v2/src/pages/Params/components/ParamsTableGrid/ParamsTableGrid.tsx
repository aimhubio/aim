import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Link } from '@material-ui/core';
import { merge } from 'lodash-es';

import TagLabel from 'components/TagLabel/TagLabel';
import COLORS from 'config/colors/colors';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { PathEnum } from 'config/enums/sideBarEnum';

function getParamsTableColumns(
  metricsColumns: any,
  paramColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  let columns: ITableColumn[] = [
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
    Object.keys(metricsColumns).reduce((acc: any, key: string) => {
      acc = [
        ...acc,
        ...Object.keys(metricsColumns[key]).map((metricContext) => ({
          key: `${key}_${metricContext}`,
          content: <TagLabel color={COLORS[0][0]} label={metricContext} />,
          topHeader: key,
          pin: order?.left?.includes(`${key}_${metricContext}`)
            ? 'left'
            : order?.right?.includes(`${key}_${metricContext}`)
            ? 'right'
            : null,
        })),
      ];
      return acc;
    }, []),
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

  if (groupFields) {
    columns.push({
      key: '#',
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

  columns = columns.map((col) => ({
    ...col,
    isHidden: hiddenColumns.includes(col.key),
  }));

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
      return 1;
    } else if (!columnsOrder.includes(b.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });
  return columns;
}

function paramsTableRowRenderer(
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
            <TagLabel
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

export { getParamsTableColumns, paramsTableRowRenderer };
