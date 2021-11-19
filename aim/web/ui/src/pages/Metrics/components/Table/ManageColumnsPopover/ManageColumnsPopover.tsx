import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { Button, Divider, InputBase } from '@material-ui/core';

import { Icon, Text } from 'components/kit';

import ColumnItem from './ColumnItem/ColumnItem';

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
  onManageColumns,
  onColumnsVisibilityChange,
  onTableDiffShow,
  hiddenColumns,
}: any) {
  const [state, setState] = React.useState<any>(initialData);
  const [searchKey, setSearchKey] = React.useState<string>('');

  function onDragEnd(result: any) {
    const { destination, source, draggableId } = result;

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
      newList.splice(destination.index, 0, draggableId);

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
        left: newState.columns.left.list,
        middle: newState.columns.middle.list,
        right: newState.columns.right.list,
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
    finishList.splice(destination.index, 0, draggableId);
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
      left: newState.columns.left.list,
      middle: newState.columns.middle.list,
      right: newState.columns.right.list,
    });
  }

  React.useEffect(() => {
    const newState = { ...state };
    const leftList = columnsData
      .filter((item: any) => item.pin === 'left')
      .map((item: any) => item.key);
    const rightList = columnsData
      .filter((item: any) => item.pin === 'right')
      .map((item: any) => item.key);
    const middleList = columnsData
      .filter((item: any) => item.pin !== 'left' && item.pin !== 'right')
      .map((item: any) => item.key);
    newState.columns.left.list = leftList;
    newState.columns.middle.list = middleList;
    newState.columns.right.list = rightList;
    setState(newState);
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='ManageColumns__container'>
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
                {state.columns.left.list.map((data: string, index: number) => (
                  <ColumnItem
                    key={`${data}-${index}`}
                    data={data}
                    index={index}
                    isHidden={!!hiddenColumns?.includes(data)}
                    onClick={() =>
                      onColumnsVisibilityChange(
                        hiddenColumns.includes(data)
                          ? hiddenColumns.filter((col: string) => col !== data)
                          : hiddenColumns.concat([data]),
                      )
                    }
                  />
                ))}
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
                  (data: string, index: number) => (
                    <ColumnItem
                      key={`${data}-${index}`}
                      data={data}
                      index={index}
                      hasSearchableItems
                      searchKey={searchKey}
                      isHidden={!!hiddenColumns?.includes(data)}
                      onClick={() =>
                        onColumnsVisibilityChange(
                          hiddenColumns.includes(data)
                            ? hiddenColumns.filter(
                                (col: string) => col !== data,
                              )
                            : hiddenColumns.concat([data]),
                        )
                      }
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
                {state.columns.right.list.map((data: string, index: number) => (
                  <ColumnItem
                    key={`${data}-${index}`}
                    data={data}
                    index={index}
                    isHidden={!!hiddenColumns?.includes(data)}
                    onClick={() =>
                      onColumnsVisibilityChange(
                        hiddenColumns.includes(data)
                          ? hiddenColumns.filter((col: string) => col !== data)
                          : hiddenColumns.concat([data]),
                      )
                    }
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
      <div className='ManageColumns__actions__container'>
        <Button
          variant='text'
          size='small'
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
        <Button variant='text' size='small' onClick={onTableDiffShow}>
          <Text size={12} tint={100}>
            show table diff
          </Text>
        </Button>
        <Divider
          style={{ margin: '0 0.875rem' }}
          orientation='vertical'
          flexItem
        />
        <Button
          variant='text'
          size='small'
          onClick={() => onColumnsVisibilityChange([])}
        >
          <Icon name='eye-show-outline' />
          <Text size={12} tint={100}>
            show all
          </Text>
        </Button>
        <Button
          variant='text'
          size='small'
          onClick={() => onColumnsVisibilityChange(['all'])}
        >
          <Icon name='eye-outline-hide' />
          <Text size={12} tint={100}>
            hide all
          </Text>
        </Button>
      </div>
    </DragDropContext>
  );
}

export default ManageColumnsPopover;
