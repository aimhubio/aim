import * as React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { merge } from 'lodash-es';

import { Link } from '@material-ui/core';

import { Badge } from 'components/kit';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

function getTablePanelColumns(
  rawData: any,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  function getRunAsColumns() {
    const columns: any = [];
    rawData.forEach((run: any) => {
      run.traces.forEach((trace: any) => {
        const column = {
          topHeader: run.props.name,
          key: `${run.hash}.${trace.name}`,
          pin: null,
          content: <span>{trace.name}</span>,
        };
        columns.push(column);
      });
    });
    return columns;
  }
  let columns: ITableColumn[] = [
    {
      key: 'step',
      content: <span>Step</span>,
      topHeader: 'Step',
      pin: order?.left?.includes('step')
        ? 'left'
        : order?.middle?.includes('step')
        ? null
        : order?.right?.includes('step')
        ? 'right'
        : 'left',
    },
    {
      key: 'index',
      content: <span>index</span>,
      topHeader: 'Index',
      pin: order?.left?.includes('index')
        ? 'left'
        : order?.right?.includes('index')
        ? 'right'
        : 'left',
    },
  ].concat(getRunAsColumns());

  columns = columns.map((col) => ({
    ...col,
    isHidden: hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === '#') {
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

function textsTablePanelRowRenderer(
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

export { getTablePanelColumns, textsTablePanelRowRenderer };
