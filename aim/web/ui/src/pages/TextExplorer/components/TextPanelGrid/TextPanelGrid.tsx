import * as React from 'react';
import _ from 'lodash-es';

import { Badge } from 'components/kit';

import COLORS from 'config/colors/colors';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import contextToString from 'utils/contextToString';

function getTablePanelColumns(
  rawData: any,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  function getRunAsColumns() {
    const columns: any = [];
    rawData.forEach((run: any) => {
      run.traces.forEach((trace: any) => {
        const key = `${run.hash}.${trace.name}`;
        const column = {
          topHeader: run.props.name,
          key,
          pin: order?.left?.includes(key)
            ? 'left'
            : order?.middle?.includes(key)
            ? null
            : order?.right?.includes(key)
            ? 'right'
            : null,
          content: (
            <span style={{ textAlign: 'center' }}>
              {trace.name}
              {'  '}
              {!_.isEmpty(trace.context) && !_.isNil(trace.context) ? (
                <Badge
                  size='small'
                  color={COLORS[0][0]}
                  label={contextToString(trace.context) || ''}
                />
              ) : (
                <Badge
                  size='small'
                  color={COLORS[0][0]}
                  label={'Empty Context'}
                />
              )}
            </span>
          ),
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
      topHeader: '',
      pin: order?.left?.includes('step')
        ? 'left'
        : order?.middle?.includes('step')
        ? null
        : order?.right?.includes('step')
        ? 'right'
        : 'left',
    },
    {
      key: 'batchIndex',
      content: <span>Index</span>,
      topHeader: '',
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

function getTablePanelRows(
  textsData: any,
  highlightOptions?: {
    regex: RegExp | null;
    foundRows: any[];
  },
) {
  if (!textsData) {
    return {
      rows: [],
      sameValueColumns: [],
    };
  }
  let rows: any[] = [];
  textsData[0].data.forEach((trace: any) => {
    let data = trace.data;
    if (highlightOptions) {
      const { regex } = highlightOptions;
      data =
        regex === null
          ? trace.data
          : trace.data
              .split(regex)
              .filter((part: string) => part !== '')
              .map((part: string, i: number) =>
                regex.test(part) ? (
                  <span
                    key={part + i}
                    className='TextExplorer__table__container__mark'
                  >
                    {part}
                  </span>
                ) : (
                  part
                ),
              );
    }

    const row = {
      step: trace.step,
      batchIndex: trace.index,
      [trace.textKey]: data,
      key: trace.textKey,
      seqKey: trace.seqKey,
      stKey: `${trace.step}.${trace.index}`,
    };
    rows.push(row);
  });

  // @ts-ignore
  rows = Object.values(_.groupBy(rows, 'key')).map((item: any) =>
    _.merge({}, ...item),
  );
  rows = _.sortBy(rows, ['step', 'index']);

  return { rows, sameValueColumns: [] };
}

export { getTablePanelColumns, getTablePanelRows };
