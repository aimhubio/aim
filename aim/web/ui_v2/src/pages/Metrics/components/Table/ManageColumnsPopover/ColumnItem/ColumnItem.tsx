import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import './ColumnItem.scss';

function ColumnItem(props: any) {
  return (
    <Draggable draggableId={props.task} index={props.index}>
      {(provided) => (
        <div
          className='ColumnItem__container'
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <span className='ColumnItem__toggle'></span>
          <div>
            <span className='ColumnItem__name'>{props.task}</span>
            <span
              className='ColumnItem__drag__icon'
              {...provided.dragHandleProps}
            >
              <i className='icon-menu'></i>
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default React.memo(ColumnItem);
