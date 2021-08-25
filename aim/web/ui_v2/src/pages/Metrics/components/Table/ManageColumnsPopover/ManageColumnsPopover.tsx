import React from 'react';
import { Button, TextField } from '@material-ui/core';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import ColumnItem from './ColumnItem/ColumnItem';

import './ManageColumnsPopover.scss';

const initialData = {
  columns: {
    leftPinned: {
      id: 'leftPinned',
      list: [],
    },
    optionsData: {
      id: 'optionsData',
      list: [],
    },
    rightPinned: {
      id: 'rightPinned',
      list: [],
    },
  },
  columnOrder: ['leftPinned', 'optionsData', 'rightPinned'],
};
function ManageColumnsPopover({ columnsData }: any) {
  const [state, setState] = React.useState<any>(initialData);

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
  }

  React.useEffect(() => {
    const optionsList = columnsData.map((item: any) => item.dataKey);
    const filteredList = optionsList.filter(
      (column: string) =>
        state.columns.leftPinned.list.indexOf(column) === -1 &&
        state.columns.rightPinned.list.indexOf(column) === -1,
    );
    const newState = { ...state };
    newState.columns.optionsData.list = filteredList;
    setState(newState);
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className='ManageColumns__container'>
        <div className='ColumnList__container'>
          <div className='ColumnList__title'>Pinned to the left</div>
          <Droppable droppableId='leftPinned'>
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
                {state.columns.leftPinned.list.map(
                  (column: any, index: number) => (
                    <ColumnItem key={column} task={column} index={index} />
                  ),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <div className='ColumnList__container'>
          <div className='ColumnList__title'>
            <TextField size='small' fullWidth placeholder='search' />
          </div>
          <Droppable droppableId='optionsData'>
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
                {state.columns.optionsData.list.map(
                  (column: any, index: number) => {
                    return (
                      <ColumnItem key={column} task={column} index={index} />
                    );
                  },
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
        <div className='ColumnList__container'>
          <div className='ColumnList__title'>Pinned to the right</div>
          <Droppable droppableId='rightPinned'>
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
                {state.columns.rightPinned.list.map(
                  (task: any, index: number) => (
                    <ColumnItem key={task} task={task} index={index} />
                  ),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
      <div className='ManageColumns__actions__container'>
        <Button variant='outlined' size='small'>
          reset columns order
        </Button>
        <Button variant='outlined' size='small'>
          show table diff
        </Button>
        <Button variant='outlined' size='small'>
          show all
        </Button>
        <Button variant='outlined' size='small'>
          hide all
        </Button>
      </div>
    </DragDropContext>
  );
}

export default React.memo(ManageColumnsPopover);
