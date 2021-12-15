import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { merge } from 'lodash-es';

import { Link, Tooltip } from '@material-ui/core';

import { Badge, Button, Icon, JsonViewPopover } from 'components/kit';
import TableSortIcons from 'components/Table/TableSortIcons';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IOnGroupingSelectChangeParams,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';

const icons: { [key: string]: string } = {
  color: 'coloring',
  stroke: 'line-style',
  chart: 'chart-group',
};

function getParamsTableColumns(
  metricsColumns: any,
  paramColumns: string[] = [],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
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
      key: 'actions',
      content: '',
      topHeader: '',
      pin: 'right',
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

function paramsTableRowRenderer(
  rowData: any,
  actions?: { [key: string]: (e: any) => void },
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col === 'groups') {
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
      actions: {
        content: (
          <Button
            withOnlyIcon={true}
            size='medium'
            onClick={actions?.toggleVisibility}
            className='Table__action__icon'
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

export { getParamsTableColumns, paramsTableRowRenderer };
