import * as React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Badge, JsonViewPopover } from 'components/kit';

import COLORS from 'config/colors/colors';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import contextToString from 'utils/contextToString';
import { encode } from 'utils/encoder/encoder';

import { MEDIA_SET_TITLE_HEIGHT } from '../../../../config/mediaConfigs/mediaConfigs';
import DepthDropdown from '../../../../components/DepthDropdown/DepthDropdown';
import ControlPopover from '../../../../components/ControlPopover/ControlPopover';

function getTablePanelColumns(
  rawData: any,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  function getRunAsColumns() {
    const columns: any = [];
    rawData.forEach((run: any) => {
      run.traces.forEach((trace: any) => {
        const key = encode({
          name: trace.name,
          runHash: run.hash,
          traceContext: trace.context,
        });

        const getContextBadgeContent = () => {
          let Element: any;
          if (!_.isEmpty(trace.context) && !_.isNil(trace.context)) {
            const contextLength = Object.keys(trace.context).length;

            if (contextLength > 1) {
              Element = (
                <ControlPopover
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  anchor={({ onAnchorClick }) => (
                    <Badge
                      onClick={onAnchorClick}
                      size='small'
                      style={{ cursor: 'pointer' }}
                      color={COLORS[0][0]}
                      label={`${contextLength} values`}
                    />
                  )}
                  component={<JsonViewPopover json={trace.context as object} />}
                />
              );
            } else {
              Element = (
                <Badge
                  size='small'
                  color={COLORS[0][0]}
                  label={contextToString(trace.context) as string}
                />
              );
            }
          } else {
            Element = (
              <Badge
                size='small'
                color={COLORS[0][0]}
                label={'Empty Context'}
              />
            );
          }

          return Element;
        };

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
            <div className='flex fac'>
              <span style={{ marginRight: '0.5rem' }}>{trace.name}</span>
              {getContextBadgeContent()}
            </div>
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
      [trace.seqKey]: <pre>{data}</pre>,
      key: trace.key,
      groupKey: `${trace.step}.${trace.index}`,
    };
    rows.push(row);
  });

  // @ts-ignore
  rows = Object.values(_.groupBy(rows, 'groupKey')).map((item: any) =>
    _.merge({}, ...item),
  );
  rows = _.sortBy(rows, ['step', 'index']);

  return { rows, sameValueColumns: [] };
}

export { getTablePanelColumns, getTablePanelRows };
