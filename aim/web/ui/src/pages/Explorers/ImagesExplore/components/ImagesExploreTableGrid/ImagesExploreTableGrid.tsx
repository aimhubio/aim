import moment from 'moment';
import _ from 'lodash-es';
import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import TableSortIcons from 'components/Table/TableSortIcons';
import { Badge, JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import GroupedColumnHeader from 'components/Table/GroupedColumnHeader';
import RunNameColumn from 'components/Table/RunNameColumn';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';
import ExperimentNameBox from 'components/ExperimentNameBox';

import COLORS from 'config/colors/colors';
import { TABLE_DATE_FORMAT } from 'config/dates/dates';
import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { IOnGroupingSelectChangeParams } from 'types/services/models/metrics/metricsAppModel';
import { ITagInfo } from 'types/pages/tags/Tags';

import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';
import { SortActionTypes, SortField } from 'utils/getSortedFields';
import getColumnOptions from 'utils/getColumnOptions';

function getImagesExploreTableColumns(
  paramColumns: string[] = [],
  groupingSelectOptions: IGroupingSelectOption[],
  groupFields: { [key: string]: unknown } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  sortFields?: any[],
  onSort?: ({ sortFields, order, index, actionType }: any) => void,
  grouping?: { [key: string]: string[] },
  onGroupingToggle?: (params: IOnGroupingSelectChangeParams) => void,
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
        AppNameEnum.IMAGES!,
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
        AppNameEnum.IMAGES!,
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
        AppNameEnum.IMAGES!,
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
        AppNameEnum.IMAGES!,
        'run.props.creation_time',
      ),
    },
    {
      key: 'duration',
      content: <span>Duration</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('date')
        ? 'left'
        : order?.middle?.includes('date')
        ? null
        : order?.right?.includes('date')
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
      key: 'name',
      content: <span>Name</span>,
      topHeader: 'Images',
      pin: order?.left?.includes('name')
        ? 'left'
        : order?.right?.includes('name')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.IMAGES!,
        'name',
      ),
    },
    {
      key: 'context',
      content: <span>Context</span>,
      topHeader: 'Images',
      pin: order?.left?.includes('context')
        ? 'left'
        : order?.right?.includes('context')
        ? 'right'
        : null,
      columnOptions: getColumnOptions(
        grouping!,
        onGroupingToggle!,
        AppNameEnum.IMAGES!,
        'context',
      ),
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
      const sortItemIndex: number =
        sortFields?.findIndex((value: SortField) => value.value === paramKey) ??
        -1;
      return {
        key: param,
        content: (
          <ErrorBoundary>
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
                          ? groupingSelectOptions.find(
                              (value) => value.value === paramKey,
                            )
                          : sortFields?.[sortItemIndex],
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
          </ErrorBoundary>
        ),
        topHeader: 'Run Params',
        pin: order?.left?.includes(param)
          ? 'left'
          : order?.right?.includes(param)
          ? 'right'
          : null,
      };
    }),
  );

  columns = columns.map((col) => ({
    ...col,
    isHidden:
      !TABLE_DEFAULT_CONFIG.images.nonHidableColumns.has(col.key) &&
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
        content: '',
        topHeader: 'Group',
        pin: 'left',
      },
      {
        key: 'groups',
        content: (
          <ErrorBoundary>
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
          </ErrorBoundary>
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

function imagesExploreTableRowRenderer(
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
      if (col === 'context') {
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
      } else if (col === 'groups') {
        row.groups = {
          content: (
            <ErrorBoundary>
              <div className='Table__groupsColumn__cell'>
                {Object.keys(rowData[col]).map((item, index) => {
                  const value: string | { [key: string]: unknown } =
                    rowData[col][item];
                  return _.isObject(value) ? (
                    <ErrorBoundary key={index}>
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
                    </ErrorBoundary>
                  ) : (
                    <Tooltip key={index} title={formatValue(value) || ''}>
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
          content: <GroupedColumnHeader data={rowData[col]} />,
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
          />
        ),
      },
      metric: rowData.metric,
      context: {
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
      },
      value: rowData.value,
      step: rowData.step,
      epoch: rowData.epoch,
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
      time:
        rowData.time === null
          ? '-'
          : moment(rowData.time).format(TABLE_DATE_FORMAT),
      actions: {
        //@TODO add hide sequence functionality
        content: (
          // <Button
          //   withOnlyIcon={true}
          //   size='small'
          //   onClick={actions?.toggleVisibility}
          //   className='Table__action__icon'
          //   role='button'
          //   aria-pressed='false'
          // >
          //   <Icon
          //     name={rowData.isHidden ? 'eye-outline-hide' : 'eye-show-outline'}
          //   />
          // </Button>
          <></>
        ),
      },
    };

    return _.merge({}, rowData, row);
  }
}

export { getImagesExploreTableColumns, imagesExploreTableRowRenderer };
