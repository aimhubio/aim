/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import _ from 'lodash-es';

import { Divider, InputBase } from '@material-ui/core';
import { AnyMessageParams } from 'yup/lib/types';

import { Button, Icon, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { HideColumnsEnum } from 'config/enums/tableEnums';
import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import ColumnItem from './ColumnItem/ColumnItem';
import { IManageColumnsPopoverProps } from './ManageColumns';

import './ManageColumnsPopover.scss';

const initialData = {
  columns: {
    left: {
      id: 'left',
      list: [],
    },
    middle: {
      id: 'middle',
      list: [],
    },
    right: {
      id: 'right',
      list: [],
    },
  },
  columnOrder: ['left', 'middle', 'right'],
};
function ManageColumnsPopover({
  columnsData,
  hiddenColumns,
  hideSystemMetrics,
  columnsOrder,
  appName,
  onManageColumns,
  onColumnsVisibilityChange,
}: IManageColumnsPopoverProps) {
  const [state, setState] = React.useState<any>(initialData);
  const [searchKey, setSearchKey] = React.useState<string>('');
  const [draggingItemId, setDraggingItemId] = React.useState<string>('');
  const [popoverWidth, setPopoverWidth] = React.useState(800);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const onResize = _.debounce(() => {
    onPopoverWidthChange();
  }, 500);

  React.useEffect(() => {
    onPopoverWidthChange();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const onPopoverWidthChange: () => void = () => {
    if (ref.current) {
      setPopoverWidth(
        parseInt(ref.current.getBoundingClientRect().width.toFixed()),
      );
    }
  };

  function onDragStart(result: any) {
    setDraggingItemId(result.draggableId);
  }

  function onDragEnd(result: any) {
    const { destination, source, draggableId } = result;
    const draggableColumn = state.columns[source.droppableId].list.find(
      (item: AnyMessageParams) => draggableId === item.key,
    );
    setDraggingItemId('');
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = state.columns[source.droppableId];
    const finish = state.columns[destination.droppableId];

    if (start === finish) {
      const newList = Array.from(start.list);
      newList.splice(source.index, 1);
      newList.splice(destination.index, 0, draggableColumn);

      const newColumn = {
        ...start,
        list: newList,
      };

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };
      setState(newState);
      onManageColumns({
        left: newState.columns.left.list.map((item: ITableColumn) => item.key),
        middle: newState.columns.middle.list.map(
          (item: ITableColumn) => item.key,
        ),
        right: newState.columns.right.list.map(
          (item: ITableColumn) => item.key,
        ),
      });
      return;
    }

    const startList = Array.from(start.list);
    startList.splice(source.index, 1);
    const newStart = {
      ...start,
      list: startList,
    };

    const finishList = Array.from(finish.list);
    finishList.splice(destination.index, 0, draggableColumn);

    const newFinish = {
      ...finish,
      list: finishList,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    setState(newState);
    onManageColumns({
      left: newState.columns.left.list.map((item: ITableColumn) => item.key),
      middle: newState.columns.middle.list.map(
        (item: ITableColumn) => item.key,
      ),
      right: newState.columns.right.list.map((item: ITableColumn) => item.key),
    });
  }

  // React.useEffect(() => {
  //   const newState = { ...state };
  //   newState.columns.left.list = [...columnsOrder.left];
  //   newState.columns.middle.list = [...columnsOrder.middle];
  //   newState.columns.right.list = [...columnsOrder.right];
  //   setState(newState);
  // }, [columnsOrder]);

  React.useEffect(() => {
    const newState = { ...state };
    const leftList = columnsData.filter(
      (item: ITableColumn) => item.pin === 'left',
    );
    const rightList = columnsData.filter(
      (item: ITableColumn) => item.pin === 'right',
    );
    const middleList = columnsData.filter(
      (item: ITableColumn) => item.pin !== 'left' && item.pin !== 'right',
    );
    newState.columns.left.list = leftList;
    newState.columns.middle.list = middleList;
    newState.columns.right.list = rightList;
    setState(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnsData]);

  React.useEffect(() => {
    const midPane = document.querySelectorAll(
      '.ColumnList__items__wrapper',
    )?.[1];
    if (!!midPane) {
      if (searchKey && searchKey.trim() !== '') {
        const firstHighlightedCol: any = midPane.querySelector(
          '.ColumnItem.highlighted',
        );
        if (!!firstHighlightedCol) {
          midPane.scrollTop =
            firstHighlightedCol?.offsetTop -
            firstHighlightedCol?.parentNode?.offsetTop -
            6;
        }
      } else {
        midPane.scrollTop = 0;
      }
    }
  }, [searchKey]);

  function onSearchKeyChange(e: any) {
    setSearchKey(e.target.value);
  }

  function isColumnHidden(column: string): boolean {
    return (
      !!hiddenColumns?.includes(column) &&
      !TABLE_DEFAULT_CONFIG[appName].nonHidableColumns.has(column)
    );
  }
  const manageColumnsChanged: boolean = React.useMemo(() => {
    return (
      !_.isEqual(
        state.columns.left.list,
        TABLE_DEFAULT_CONFIG[appName].columnsOrder.left,
      ) ||
      !_.isEqual(
        state.columns.right.list,
        TABLE_DEFAULT_CONFIG[appName].columnsOrder.right,
      ) ||
      !_.isEqual(hiddenColumns, TABLE_DEFAULT_CONFIG[appName].hiddenColumns)
    );
  }, [appName, hiddenColumns, state]);

  return (
    <ErrorBoundary>
      <ControlPopover
        title='Manage table columns'
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        anchor={({ onAnchorClick, opened }) => (
          <Button
            color='secondary'
            variant='text'
            size='small'
            onClick={onAnchorClick}
            className={`ManageColumns__trigger ${
              opened || manageColumnsChanged ? 'opened' : ''
            }`}
          >
            <Icon name='manage-column' />
            <Text size={14} tint={100}>
              Manage Columns
            </Text>
          </Button>
        )}
        component={
          <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <div ref={ref} className='ManageColumns__container'>
              <div className='ColumnList__container'>
                <div className='ColumnList__title'>Pinned to the left</div>
                <Droppable droppableId='left'>
                  {(provided, snapshot) => (
                    <div
                      className={`ColumnList__items__wrapper ${
                        snapshot.isDraggingOver
                          ? 'ColumnList__items__wrapper__dragging'
                          : ''
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {state.columns.left.list.map(
                        (column: ITableColumn, index: number) => (
                          <ColumnItem
                            key={`${column.key}-${index}`}
                            data={column.key}
                            label={column.label ?? column.key}
                            index={index}
                            popoverWidth={popoverWidth}
                            appName={appName}
                            isHidden={isColumnHidden(column.key)}
                            onClick={() =>
                              onColumnsVisibilityChange(
                                hiddenColumns?.includes(column.key)
                                  ? hiddenColumns?.filter(
                                      (col: string) => col !== column.key,
                                    )
                                  : hiddenColumns?.concat([column.key]),
                              )
                            }
                            draggingItemId={draggingItemId}
                          />
                        ),
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              <div className='ColumnList__container'>
                <div className='ColumnList__title'>
                  <div className='ManageColumns__Search'>
                    <div className='ManageColumns__Search__icon'>
                      <Icon name='search' />
                    </div>
                    <InputBase
                      fullWidth
                      placeholder='Search'
                      value={searchKey}
                      onChange={onSearchKeyChange}
                      inputProps={{ 'aria-label': 'search' }}
                    />
                  </div>
                </div>
                <Droppable droppableId='middle'>
                  {(provided, snapshot) => (
                    <div
                      className={`ColumnList__items__wrapper ${
                        snapshot.isDraggingOver
                          ? 'ColumnList__items__wrapper__dragging'
                          : ''
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {state.columns.middle.list.map(
                        (column: ITableColumn, index: number) => (
                          <ColumnItem
                            key={`${column.key}-${index}`}
                            data={column.key}
                            label={column.label ?? column.key}
                            index={index}
                            appName={appName}
                            popoverWidth={popoverWidth}
                            hasSearchableItems
                            searchKey={searchKey}
                            isHidden={isColumnHidden(column.key)}
                            onClick={() =>
                              onColumnsVisibilityChange(
                                hiddenColumns?.includes(column.key)
                                  ? hiddenColumns?.filter(
                                      (col: string) => col !== column.key,
                                    )
                                  : hiddenColumns?.concat([column.key]),
                              )
                            }
                            draggingItemId={draggingItemId}
                          />
                        ),
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              <div className='ColumnList__container'>
                <div className='ColumnList__title'>Pinned to the right</div>
                <Droppable droppableId='right'>
                  {(provided, snapshot) => (
                    <div
                      className={`ColumnList__items__wrapper ${
                        snapshot.isDraggingOver
                          ? 'ColumnList__items__wrapper__dragging'
                          : ''
                      }`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {state.columns.right.list.map(
                        (column: ITableColumn, index: number) => {
                          return (
                            <ColumnItem
                              key={`${column.key}-${index}`}
                              data={column.key}
                              label={column.label ?? column.key}
                              index={index}
                              appName={appName}
                              popoverWidth={popoverWidth}
                              isHidden={isColumnHidden(column.key)}
                              onClick={() =>
                                onColumnsVisibilityChange(
                                  hiddenColumns.includes(column.key)
                                    ? hiddenColumns.filter(
                                        (col: string) => col !== column.key,
                                      )
                                    : hiddenColumns.concat([column.key]),
                                )
                              }
                              draggingItemId={draggingItemId}
                            />
                          );
                        },
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
            <div className='ManageColumns__actions__container'>
              <div>
                <Button
                  variant='text'
                  size='xSmall'
                  onClick={() =>
                    onManageColumns({
                      left: [],
                      middle: [],
                      right: [],
                    })
                  }
                >
                  <Text size={12} tint={100}>
                    reset columns order
                  </Text>
                </Button>
              </div>
              <div className='flex'>
                {hideSystemMetrics !== undefined && (
                  <>
                    <Button
                      variant='text'
                      size='xSmall'
                      onClick={() =>
                        onColumnsVisibilityChange(
                          hideSystemMetrics
                            ? HideColumnsEnum.ShowSystemMetrics
                            : HideColumnsEnum.HideSystemMetrics,
                        )
                      }
                    >
                      <Icon
                        name={
                          `${
                            hideSystemMetrics ? 'show' : 'hide'
                          }-system-metrics` as IconName
                        }
                      />
                      <Text size={12} tint={100}>
                        {hideSystemMetrics ? 'show' : 'hide'} system metrics
                      </Text>
                    </Button>
                    <Divider
                      style={{ margin: '0 0.875rem' }}
                      orientation='vertical'
                      flexItem
                    />
                  </>
                )}

                <Button
                  variant='text'
                  size='xSmall'
                  onClick={() => onColumnsVisibilityChange([])}
                >
                  <Icon name='eye-show-outline' color='#1473e6' />
                  <Text size={12} tint={100}>
                    show all
                  </Text>
                </Button>
                <Button
                  variant='text'
                  size='xSmall'
                  onClick={() => onColumnsVisibilityChange(HideColumnsEnum.All)}
                >
                  <Icon name='eye-outline-hide' />
                  <Text size={12} tint={100}>
                    hide all
                  </Text>
                </Button>
              </div>
            </div>
          </DragDropContext>
        }
      />
    </ErrorBoundary>
  );
}

export default ManageColumnsPopover;
