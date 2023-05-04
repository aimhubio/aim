import _ from 'lodash-es';
import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import { Badge, Button, Icon, JsonViewPopover } from 'components/kit';
import TableSortIcons from 'components/Table/TableSortIcons';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import RunNameColumn from 'components/Table/RunNameColumn';
import GroupedColumnHeader from 'components/Table/GroupedColumnHeader';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import ExperimentNameBox from 'components/ExperimentNameBox';

import COLORS from 'config/colors/colors';
import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IOnGroupingSelectChangeParams } from 'types/services/models/metrics/metricsAppModel';
import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { ITagInfo } from 'types/pages/tags/Tags';

import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';
import { SortActionTypes, SortField } from 'utils/getSortedFields';
import getColumnOptions from 'utils/getColumnOptions';
import { getMetricHash } from 'utils/app/getMetricHash';
import { getMetricLabel } from 'utils/app/getMetricLabel';
import { isSystemMetric } from 'utils/isSystemMetric';

function getParamsTableColumns(
  sortOptions: IGroupingSelectOption[],
  metricsColumns: any,
  paramColumns: string[] = [],
  groupFields: { [key: string]: unknown } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  sortFields?: any[],
  onSort?: ({ sortFields, order, index, actionType }: any) => void,
  grouping?: { [key: string]: string[] },
  onGroupingToggle?: (params: IOnGroupingSelectChangeParams) => void,
  appName?: AppNameEnum,
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'experiment',
      content: <span>Name</span>,
      topHeader: 'Experiment',
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
        appName!,
        'run.props.experiment.name',
      ),
    },
    {
      key: 'experiment_description',
      content: <span>Description</span>,
      topHeader: 'Experiment',
      pin: order?.left?.includes('experiment_description')
        ? 'left'
        : order?.middle?.includes('experiment_description')
        ? null
        : order?.right?.includes('experiment_description')
        ? 'right'
        : null,
    },
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
        appName!,
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
        appName!,
        'run.props.name',
      ),
    },

    {
      key: 'description',
      content: <span>Description</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('description')
        ? 'left'
        : order?.middle?.includes('description')
        ? null
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
        : order?.middle?.includes('date')
        ? null
        : order?.right?.includes('date')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        appName!,
        'run.props.experiment.name',
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
      key: 'tags',
      content: <span>Tags</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('tags')
        ? 'left'
        : order?.right?.includes('tags')
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
    Object.keys(metricsColumns).reduce((acc: any, metricName: string) => {
      const systemMetricsList: ITableColumn[] = [];
      const isSystem = isSystemMetric(metricName);
      const metricsList: ITableColumn[] = [];
      Object.keys(metricsColumns[metricName]).forEach((metricContext) => {
        const metricHash = getMetricHash(metricName, metricContext);
        const metricLabel = getMetricLabel(metricName, metricContext);

        const sortValueKey = `metricsLastValues.${metricHash}`;
        const sortItemIndex: number =
          sortFields?.findIndex((value: SortField) => {
            return value.value === sortValueKey;
          }) ?? -1;
        let column = {
          key: metricHash,
          label: metricLabel,
          content: isSystem ? (
            <span>
              {formatSystemMetricName(metricName)}
              {onSort && (
                <TableSortIcons
                  onSort={() =>
                    onSort({
                      sortFields,
                      index: sortItemIndex,
                      field:
                        sortItemIndex === -1
                          ? sortOptions.find(
                              (value) => value.value === sortValueKey,
                            )
                          : (sortFields?.[sortItemIndex] as SortField),
                      actionType:
                        sortFields?.[sortItemIndex]?.order === 'desc'
                          ? SortActionTypes.DELETE
                          : SortActionTypes.ORDER_TABLE_TRIGGER,
                    })
                  }
                  sort={
                    !_.isNil(sortFields?.[sortItemIndex])
                      ? sortFields?.[sortItemIndex]?.order
                      : null
                  }
                />
              )}
            </span>
          ) : (
            <div>
              <Badge
                monospace
                size='xSmall'
                color={COLORS[0][0]}
                label={metricContext === '' ? 'Empty context' : metricContext}
              />
              {onSort && (
                <TableSortIcons
                  onSort={() =>
                    onSort({
                      sortFields,
                      index: sortItemIndex,
                      field:
                        sortItemIndex === -1
                          ? sortOptions.find(
                              (value) => value.value === sortValueKey,
                            )
                          : (sortFields?.[sortItemIndex] as SortField),
                      actionType:
                        sortFields?.[sortItemIndex]?.order === 'desc'
                          ? SortActionTypes.DELETE
                          : SortActionTypes.ORDER_TABLE_TRIGGER,
                    })
                  }
                  sort={
                    !_.isNil(sortFields?.[sortItemIndex])
                      ? sortFields?.[sortItemIndex]?.order
                      : null
                  }
                />
              )}
            </div>
          ),
          topHeader: isSystem ? 'System Metrics' : metricName,
          pin: order?.left?.includes(metricHash)
            ? 'left'
            : order?.right?.includes(metricHash)
            ? 'right'
            : null,
        };
        isSystem ? systemMetricsList.push(column) : metricsList.push(column);
      });
      acc = [
        ...acc,
        ...metricsList.sort(alphabeticalSortComparator({ orderBy: 'key' })),
        ...systemMetricsList.sort(
          alphabeticalSortComparator({ orderBy: 'key' }),
        ),
      ];
      return acc;
    }, []),
    paramColumns.map((param) => {
      const paramKey = `run.params.${param}`;
      const sortItemIndex: number =
        sortFields?.findIndex((value: SortField) => value.value === paramKey) ??
        -1;

      return {
        key: param,
        label: param,
        content: (
          <span>
            {param}
            {onSort && (
              <TableSortIcons
                onSort={() =>
                  onSort({
                    sortFields,
                    index: sortItemIndex,
                    field:
                      sortItemIndex === -1
                        ? sortOptions.find((value) => value.value === paramKey)
                        : sortFields?.[sortItemIndex],
                    actionType:
                      sortFields?.[sortItemIndex]?.order === 'desc'
                        ? SortActionTypes.DELETE
                        : SortActionTypes.ORDER_TABLE_TRIGGER,
                  })
                }
                sort={
                  !_.isNil(sortFields?.[sortItemIndex])
                    ? sortFields?.[sortItemIndex].order
                    : null
                }
              />
            )}
          </span>
        ),
        topHeader: 'Run Params',
        pin: order?.left?.includes(param)
          ? 'left'
          : order?.right?.includes(param)
          ? 'right'
          : null,
        columnOptions: getColumnOptions(
          grouping!,
          onGroupingToggle!,
          appName!,
          paramKey,
        ),
      };
    }),
  );

  columns = columns.map((col) => ({
    ...col,
    isHidden:
      !TABLE_DEFAULT_CONFIG.params.nonHidableColumns.has(col.key) &&
      hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === '#') {
      return -1;
    } else if (a.key === 'actions') {
      return 1;
    } else if (b.key === 'actions') {
      return -1;
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
              name = name.replace(
                'run.props.experiment.name',
                'run.props.experiment',
              );
              name = name.replace('run.props', 'run');
              return (
                <Tooltip key={field} title={name || ''}>
                  <div>{name}</div>
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
  return columns;
}

const TagsColumn = (props: {
  runHash: string;
  tags: ITagInfo[];
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void;
  headerRenderer: () => React.ReactNode;
  addTagButtonSize: 'xxSmall' | 'xSmall';
}) => {
  return <AttachedTagsList {...props} inlineAttachedTagsList />;
};

function paramsTableRowRenderer(
  rowData: any,
  onRunsTagsChange: (runHash: string, tags: ITagInfo[]) => void,
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
      } else if (Array.isArray(rowData[col])) {
        row[col] = {
          content: (
            <ErrorBoundary>
              <GroupedColumnHeader data={rowData[col]} />
            </ErrorBoundary>
          ),
        };
      }
    }
    return _.merge({}, rowData, row);
  } else {
    const row = {
      experiment: {
        content: (
          <ExperimentNameBox
            experimentName={rowData.experiment}
            experimentId={rowData.experimentId}
          />
        ),
      },
      run: {
        content: (
          <RunNameColumn
            run={rowData.run}
            runHash={rowData.hash}
            active={rowData.active}
            hidden={rowData.isHidden}
          />
        ),
      },
      tags: {
        content: (
          <TagsColumn
            runHash={rowData.hash}
            tags={rowData.tags}
            onRunsTagsChange={onRunsTagsChange}
            headerRenderer={() => <></>}
            addTagButtonSize='xxSmall'
          />
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

    return _.merge({}, rowData, row);
  }
}

export { getParamsTableColumns, paramsTableRowRenderer };
