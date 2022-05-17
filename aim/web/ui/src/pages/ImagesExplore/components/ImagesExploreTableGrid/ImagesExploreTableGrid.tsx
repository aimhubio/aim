import moment from 'moment';
import _ from 'lodash-es';
import { Link as RouteLink } from 'react-router-dom';

import { Link, Tooltip } from '@material-ui/core';

import TableSortIcons from 'components/Table/TableSortIcons';
import { Badge, JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';
import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';

import contextToString from 'utils/contextToString';
import { formatValue } from 'utils/formatValue';
import { SortActionTypes, SortField } from 'utils/getSortedFields';

function getImagesExploreTableColumns(
  paramColumns: string[] = [],
  groupingSelectOptions: IGroupingSelectOption[],
  groupFields: { [key: string]: string } | null,
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
  sortFields?: any[],
  onSort?: ({ sortFields, order, index, actionType }: any) => void,
): ITableColumn[] {
  let columns: ITableColumn[] = [
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
    },
    {
      key: 'run',
      content: <span>Run Name</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.middle?.includes('run')
        ? null
        : order?.right?.includes('run')
        ? 'right'
        : 'left',
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
          <ErrorBoundary>
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
          </ErrorBoundary>
        ),
        topHeader: 'Params',
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
          <ErrorBoundary>
            <div className='Table__groupsColumn__cell'>
              {Object.keys(groupFields).map((field) => {
                let name: string = field.replace('run.params.', '');
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
        topHeader: 'Groups',
      },
      ...columns,
    ];
  }
  return columns;
}

function imagesExploreTableRowRenderer(
  rowData: any,
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
              <Badge
                monospace
                size='xSmall'
                color={COLORS[0][0]}
                label={`${rowData.context.length} values`}
              />
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
          content: (
            <Badge
              monospace
              size='xSmall'
              color={COLORS[0][0]}
              label={`${rowData[col].length} values`}
            />
          ),
        };
      }
    }

    return _.merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData?.experiment ?? 'default',
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
      metric: rowData.metric,
      context: {
        content:
          rowData.context.length > 1 ? (
            <Badge
              monospace
              size='xSmall'
              color={COLORS[0][0]}
              label={`${rowData.context.length} values`}
            />
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
