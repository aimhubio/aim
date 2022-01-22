import moment from 'moment';
import _ from 'lodash-es';
import { Link as RouteLink } from 'react-router-dom';

import { Link, Tooltip } from '@material-ui/core';

import TableSortIcons from 'components/Table/TableSortIcons';
import { Badge, JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

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
      topHeader: 'Images',
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
      topHeader: 'Images',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.right?.includes('run')
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
                        : null,
                    actionType: SortActionTypes.ORDER_TABLE_TRIGGER,
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
                size='small'
                color={COLORS[0][0]}
                label={`${rowData.context.length} values`}
              />
            ) : (
              <Badge
                size='small'
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
            : moment(rowData.time).format('HH:mm:ss · D MMM, YY');
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

    return _.merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData?.experiment?.name ?? 'default',
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
        content: rowData.context.map((item: string) => (
          <Badge
            key={item}
            size='small'
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
          : moment(rowData.time).format('HH:mm:ss · D MMM, YY'),
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
