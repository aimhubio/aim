import moment from 'moment';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import TableSortIcons from 'components/Table/TableSortIcons';
import { Badge, Button, Icon } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import JsonViewPopover from 'components/kit/JsonViewPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import RunNameColumn from 'components/Table/RunNameColumn';
import GroupedColumnHeader from 'components/Table/GroupedColumnHeader';

import COLORS from 'config/colors/colors';
import { TABLE_DATE_FORMAT } from 'config/dates/dates';
import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IOnGroupingSelectChangeParams } from 'types/services/models/metrics/metricsAppModel';
import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';
import { SortActionTypes, SortField, SortFields } from 'utils/getSortedFields';
import getColumnOptions from 'utils/getColumnOptions';

function getMetricsTableColumns(
  paramColumns: string[] = [],
  groupingSelectOptions: IGroupingSelectOption[],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  aggregationMethods?: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  },
  sortFields?: SortFields,
  onSort?: ({ sortFields, order, index, actionType }: any) => void,
  grouping?: { [key: string]: string[] },
  onGroupingToggle?: (params: IOnGroupingSelectChangeParams) => void,
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'hash',
      content: <span>Hash</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('hash')
        ? 'left'
        : order?.middle?.includes('hash')
        ? null
        : order?.right?.includes('hash')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'run.hash',
      ),
    },
    {
      key: 'run',
      content: <span>Name</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.middle?.includes('run')
        ? null
        : order?.right?.includes('run')
        ? 'right'
        : 'left',
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'run.props.name',
      ),
    },
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('experiment')
        ? 'left'
        : order?.middle?.includes('experiment')
        ? null
        : order?.right?.includes('experiment')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'run.props.experiment.name',
      ),
    },
    {
      key: 'description',
      content: <span>Description</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('description')
        ? 'left'
        : order?.right?.includes('description')
        ? 'right'
        : null,
    },
    {
      key: 'date',
      content: <span>Date</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('date')
        ? 'left'
        : order?.right?.includes('date')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'run.props.creation_time',
      ),
    },
    {
      key: 'duration',
      content: <span>Duration</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('duration')
        ? 'left'
        : order?.right?.includes('duration')
        ? 'right'
        : null,
    },
    {
      key: 'metric',
      content: <span>Name</span>,
      topHeader: 'Metric',
      pin: order?.left?.includes('metric')
        ? 'left'
        : order?.right?.includes('metric')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'name',
      ),
    },
    {
      key: 'context',
      content: <span>Context</span>,
      topHeader: 'Metric',
      pin: order?.left?.includes('context')
        ? 'left'
        : order?.right?.includes('context')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.METRICS!,
        'context',
      ),
    },
    {
      key: 'value',
      content: groupFields ? (
        <div className='Metrics__table__aggregationColumn__cell'>
          <span>Group Min</span>
          <span>
            {aggregationMethods!.line === AggregationLineMethods.MEAN
              ? 'Mean'
              : aggregationMethods!.line === AggregationLineMethods.MEDIAN
              ? 'Median'
              : aggregationMethods!.line === AggregationLineMethods.MIN
              ? 'Min'
              : 'Max'}
          </span>
          <span>Group Max</span>
          {aggregationMethods!.area === AggregationAreaMethods.STD_DEV && (
            <span>Std. Dev.</span>
          )}
          {aggregationMethods!.area === AggregationAreaMethods.STD_ERR && (
            <span>Std. Err.</span>
          )}
        </div>
      ) : (
        <span>Value</span>
      ),
      topHeader: groupFields ? 'Value' : 'Metric',
      pin: order?.left?.includes('value')
        ? 'left'
        : order?.right?.includes('value')
        ? 'right'
        : null,
    },
    {
      key: 'step',
      content: <span>Step</span>,
      topHeader: 'Metric',
      pin: order?.left?.includes('step')
        ? 'left'
        : order?.right?.includes('step')
        ? 'right'
        : null,
    },
    {
      key: 'epoch',
      content: <span>Epoch</span>,
      topHeader: 'Metric',
      pin: order?.left?.includes('epoch')
        ? 'left'
        : order?.right?.includes('epoch')
        ? 'right'
        : null,
    },
    {
      key: 'time',
      content: <span>Time</span>,
      topHeader: 'Metric',
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
      let index = -1;
      const sortItem: SortField | undefined = sortFields?.find((value, i) => {
        if (value.value === paramKey) {
          index = i;
        }
        return value.value === paramKey;
      });
      return {
        key: param,
        content: (
          <span>
            {param}
            {onSort && (
              <TableSortIcons
                onSort={() =>
                  onSort({
                    sortFields,
                    index,
                    field:
                      index === -1
                        ? groupingSelectOptions.find(
                            (value) => value.value === paramKey,
                          )
                        : sortItem,
                    actionType:
                      sortItem?.order === 'desc'
                        ? SortActionTypes.DELETE
                        : SortActionTypes.ORDER_TABLE_TRIGGER,
                  })
                }
                sort={!_.isNil(sortItem) ? sortItem.order : null}
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
        columnOptions: getColumnOptions(
          grouping!,
          onGroupingToggle!,
          AppNameEnum.METRICS!,
          paramKey,
        ),
      };
    }),
  );

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

  if (groupFields) {
    columns = [
      {
        key: '#',
        content: '',
        topHeader: 'Group',
        pin: 'left',
      },
      {
        key: 'groups',
        content: (
          <div className='Table__groupsColumn__cell'>
            {Object.keys(groupFields).map((field) => {
              let name: string = field.replace('run.params.', '');
              name = name.replace(
                'run.props.experiment.name',
                'run.props.experiment',
              );
              name = name.replace('run.props', 'run');
              return (
                <Tooltip key={field} title={name || ''}>
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
        topHeader: 'Group Config',
      },
      ...columns,
    ];
  }
  columns = columns.map((col) => ({
    ...col,
    isHidden:
      !TABLE_DEFAULT_CONFIG.metrics.nonHidableColumns.has(col.key) &&
      hiddenColumns.includes(col.key),
  }));
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
              <GroupedColumnHeader data={rowData.metric} />
            ) : (
              <span>{metricName}</span>
            ),
        };
      } else if (col === 'context') {
        row[col] = {
          content:
            rowData.context.length > 1 ? (
              <GroupedColumnHeader data={rowData.context} />
            ) : (
              <Badge
                monospace
                size='xSmall'
                color={COLORS[0][0]}
                label={rowData.context[0] || 'Empty Context'}
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
              {!_.isNil(rowData.aggregation.area.stdDevValue) && (
                <span key='stdDevValue'>
                  {rowData.aggregation.area.stdDevValue}
                </span>
              )}
              {!_.isNil(rowData.aggregation.area.stdErrValue) && (
                <span key='stdErrValue'>
                  {rowData.aggregation.area.stdErrValue}
                </span>
              )}
            </div>
          ),
        };
      } else if (col === 'groups') {
        row.groups = {
          content: (
            <ErrorBoundary>
              <div className='Table__groupsColumn__cell'>
                {Object.keys(rowData[col]).map((item) => {
                  const value: string | { [key: string]: unknown } =
                    rowData[col][item];
                  return _.isObject(value) ? (
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
                        <Tooltip
                          title={(contextToString(value) as string) || ''}
                        >
                          <span onClick={onAnchorClick}>
                            {contextToString(value)}
                          </span>
                        </Tooltip>
                      )}
                      component={<JsonViewPopover json={value} />}
                    />
                  ) : (
                    <Tooltip key={item} title={formatValue(value) || ''}>
                      <div>{formatValue(value)}</div>
                    </Tooltip>
                  );
                })}
              </div>
            </ErrorBoundary>
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
            : moment(rowData.time).format(TABLE_DATE_FORMAT);
      } else if (Array.isArray(rowData[col])) {
        row[col] = {
          content: <GroupedColumnHeader data={rowData[col]} />,
        };
      }
    }

    return _.merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData.experiment,
      run: {
        content: (
          <RunNameColumn
            run={rowData.run}
            runHash={rowData.hash}
            active={rowData.active}
          />
        ),
      },
      metric: isSystemMetric(rowData.metric)
        ? formatSystemMetricName(rowData.metric)
        : rowData.metric,
      context: {
        content: rowData.context.map((item: string) => (
          <Badge
            monospace
            key={item}
            size='xSmall'
            color={COLORS[0][0]}
            label={item || 'Empty Context'}
          />
        )),
      },
      value: rowData.value,
      step: rowData.step,
      epoch: rowData.epoch,
      time:
        rowData.time === null
          ? '-'
          : moment(rowData.time).format(TABLE_DATE_FORMAT),
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
    return _.merge({}, rowData, row);
  }
}

export { getMetricsTableColumns, metricsTableRowRenderer };
