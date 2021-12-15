import React from 'react';
import moment from 'moment';
import { Link as RouteLink } from 'react-router-dom';
import { merge } from 'lodash-es';

import { Link, Tooltip } from '@material-ui/core';

import TableSortIcons from 'components/Table/TableSortIcons';
import { Badge, Button, Icon } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import JsonViewPopover from 'components/kit/JsonViewPopover';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IOnGroupingSelectChangeParams,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';

const icons: { [key: string]: string } = {
  color: 'coloring',
  stroke: 'line-style',
  chart: 'chart-group',
};

function getMetricsTableColumns(
  paramColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  aggregationMethods?: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  },
  sortFields?: any[],
  onSort?: (field: string, value?: 'asc' | 'desc' | 'none') => void,
  grouping?: { [key: string]: string[] },
  onGroupingToggle?: (params: IOnGroupingSelectChangeParams) => void,
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
      columnOptions: ['color', 'stroke', 'chart'].map((groupName: string) => ({
        value: `${
          grouping?.[groupName]?.includes('run.props.experiment') ? 'un' : ''
        }group by ${groupName}`,
        onClick: () => {
          if (onGroupingToggle) {
            onGroupingToggle({
              groupName,
              list: grouping?.[groupName]?.includes('run.props.experiment')
                ? grouping?.[groupName].filter(
                    (item) => item !== 'run.props.experiment',
                  )
                : grouping?.[groupName].concat(['run.props.experiment']),
            } as IOnGroupingSelectChangeParams);
          }
        },
        icon: icons[groupName],
      })),
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
      columnOptions: ['color', 'stroke', 'chart'].map((groupName: string) => ({
        value: `${
          grouping?.[groupName]?.includes('run.hash') ? 'un' : ''
        }group by ${groupName}`,
        onClick: () => {
          if (onGroupingToggle) {
            onGroupingToggle({
              groupName,
              list: grouping?.[groupName]?.includes('run.hash')
                ? grouping?.[groupName].filter((item) => item !== 'run.hash')
                : grouping?.[groupName].concat(['run.hash']),
            } as IOnGroupingSelectChangeParams);
          }
        },
        icon: icons[groupName],
      })),
    },
    {
      key: 'metric',
      content: <span>Metric</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('metric')
        ? 'left'
        : order?.right?.includes('metric')
        ? 'right'
        : null,
      columnOptions: ['color', 'stroke', 'chart'].map((groupName: string) => ({
        value: `${
          grouping?.[groupName]?.includes('name') ? 'un' : ''
        }group by ${groupName}`,
        onClick: () => {
          if (onGroupingToggle) {
            onGroupingToggle({
              groupName,
              list: grouping?.[groupName]?.includes('name')
                ? grouping?.[groupName].filter((item) => item !== 'name')
                : grouping?.[groupName].concat(['name']),
            } as IOnGroupingSelectChangeParams);
          }
        },
        icon: icons[groupName],
      })),
    },
    {
      key: 'context',
      content: <span>Context</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('context')
        ? 'left'
        : order?.right?.includes('context')
        ? 'right'
        : null,
    },
    {
      key: 'value',
      content: groupFields ? (
        <div className='Metrics__table__aggregationColumn__cell'>
          <span>Area Min</span>
          <span>
            {aggregationMethods!.line === AggregationLineMethods.MEAN
              ? 'Mean'
              : aggregationMethods!.line === AggregationLineMethods.MEDIAN
              ? 'Median'
              : aggregationMethods!.line === AggregationLineMethods.MIN
              ? 'Min'
              : 'Max'}
          </span>
          <span>Area Max</span>
        </div>
      ) : (
        <span>Value</span>
      ),
      topHeader: groupFields ? 'Value' : 'Metrics',
      pin: order?.left?.includes('value')
        ? 'left'
        : order?.right?.includes('value')
        ? 'right'
        : null,
    },
    {
      key: 'step',
      content: <span>Step</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('step')
        ? 'left'
        : order?.right?.includes('step')
        ? 'right'
        : null,
    },
    {
      key: 'epoch',
      content: <span>Epoch</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('epoch')
        ? 'left'
        : order?.right?.includes('epoch')
        ? 'right'
        : null,
    },
    {
      key: 'time',
      content: <span>Time</span>,
      topHeader: 'Metrics',
      pin: order?.left?.includes('time')
        ? 'left'
        : order?.right?.includes('time')
        ? 'right'
        : null,
    },
    {
      key: 'actions',
      content: '',
      topHeader: '',
      pin: 'right',
    },
  ].concat(
    paramColumns.map((param) => {
      const paramKey = `run.params.${param}`;
      const sortItem: SortField = sortFields?.find(
        (value) => value[0] === paramKey,
      );

      return {
        key: param,
        content: (
          <span>
            {param}
            {onSort && (
              <TableSortIcons
                onSort={() => onSort(paramKey)}
                sortFields={sortFields}
                sort={Array.isArray(sortItem) ? sortItem[1] : null}
              />
            )}
          </span>
        ),
        topHeader: 'Params',
        pin: order?.left?.includes(param)
          ? 'left'
          : order?.right?.includes(param)
          ? 'right'
          : null,
        columnOptions: ['color', 'stroke', 'chart'].map(
          (groupName: string) => ({
            value: `${
              grouping?.[groupName]?.includes(paramKey) ? 'un' : ''
            }group by ${groupName}`,
            onClick: () => {
              if (onGroupingToggle) {
                onGroupingToggle({
                  groupName,
                  list: grouping?.[groupName]?.includes(paramKey)
                    ? grouping?.[groupName].filter((item) => item !== paramKey)
                    : grouping?.[groupName].concat([paramKey]),
                } as IOnGroupingSelectChangeParams);
              }
            },
            icon: icons[groupName],
          }),
        ),
      };
    }),
  );

  if (groupFields) {
    columns = [
      {
        key: '#',
        content: (
          <span
            style={{
              textAlign: 'right',
              display: 'inline-block',
              width: '100%',
            }}
          >
            #
          </span>
        ),
        topHeader: 'Grouping',
        pin: 'left',
      },
      {
        key: 'groups',
        content: (
          <div className='Table__groupsColumn__cell'>
            {Object.keys(groupFields).map((field) => {
              let name: string = field.replace('run.params.', '');
              name = name.replace('run.props', 'run');
              return (
                <Tooltip key={field} title={name}>
                  <span>{name}</span>
                </Tooltip>
              );
            })}
          </div>
        ),
        pin: order?.left?.includes('groups')
          ? 'left'
          : order?.right?.includes('groups')
          ? 'right'
          : null,
        topHeader: 'Groups',
      },
      ...columns,
    ];
  }

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

function metricsTableRowRenderer(
  rowData: any,
  actions?: { [key: string]: (e: any) => void },
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col === 'metric') {
        let metricName: string = isSystemMetric(rowData[col])
          ? formatSystemMetricName(rowData[col])
          : rowData[col];
        row.metric = {
          content:
            Array.isArray(rowData.metric) && rowData.metric.length > 1 ? (
              <Badge
                size='small'
                color={COLORS[0][0]}
                label={`${rowData.context.length} values`}
              />
            ) : (
              <span>{metricName}</span>
            ),
        };
      } else if (col === 'context') {
        row[col] = {
          content:
            rowData.context.length > 1 ? (
              <Badge
                size='small'
                color={COLORS[0][0]}
                label={`${rowData.context.length} values`}
              />
            ) : (
              <Badge
                size='small'
                color={COLORS[0][0]}
                label={rowData.context[0] || 'No Context'}
              />
            ),
        };
      } else if (col === 'value') {
        row.value = {
          content: (
            <div className='Metrics__table__aggregationColumn__cell'>
              <span key='min'>{rowData.aggregation.area.min}</span>
              <span key='line'>{rowData.aggregation.line}</span>
              <span key='max'>{rowData.aggregation.area.max}</span>
            </div>
          ),
        };
      } else if (col === 'groups') {
        row.groups = {
          content: (
            <div className='Table__groupsColumn__cell'>
              {Object.keys(rowData[col]).map((item) => {
                const value: string | { [key: string]: unknown } =
                  rowData[col][item];
                return typeof value === 'object' ? (
                  <ControlPopover
                    key={contextToString(value)}
                    title={item}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    anchor={({ onAnchorClick }) => (
                      <Tooltip title={contextToString(value) as string}>
                        <span onClick={onAnchorClick}>
                          {contextToString(value)}
                        </span>
                      </Tooltip>
                    )}
                    component={<JsonViewPopover json={value} />}
                  />
                ) : (
                  <Tooltip key={item} title={value}>
                    <span>{formatValue(value)}</span>
                  </Tooltip>
                );
              })}
            </div>
          ),
        };
      } else if (['step', 'epoch'].includes(col)) {
        row[col] =
          rowData[col] === null
            ? '-'
            : Array.isArray(rowData[col])
            ? ''
            : rowData[col];
      } else if (col === 'time') {
        row[col] =
          rowData.time === null
            ? '-'
            : Array.isArray(rowData.time)
            ? ''
            : moment(rowData.time).format('HH:mm:ss · D MMM, YY');
      } else if (Array.isArray(rowData[col])) {
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
      metric: isSystemMetric(rowData.metric)
        ? formatSystemMetricName(rowData.metric)
        : rowData.metric,
      context: {
        content: rowData.context.map((item: string) => (
          <Badge
            key={item}
            size='small'
            color={COLORS[0][0]}
            label={item || 'No Context'}
          />
        )),
      },
      value: rowData.value,
      step: rowData.step,
      epoch: rowData.epoch,
      time:
        rowData.time === null
          ? '-'
          : moment(rowData.time).format('HH:mm:ss · D MMM, YY'),
      actions: {
        content: (
          <Button
            withOnlyIcon={true}
            size='medium'
            onClick={actions?.toggleVisibility}
            className='Table__action__icon'
            role='button'
            aria-pressed='false'
          >
            <Icon
              name={rowData.isHidden ? 'eye-outline-hide' : 'eye-show-outline'}
            />
          </Button>
        ),
      },
    };

    return merge({}, rowData, row);
  }
}

export { getMetricsTableColumns, metricsTableRowRenderer };
