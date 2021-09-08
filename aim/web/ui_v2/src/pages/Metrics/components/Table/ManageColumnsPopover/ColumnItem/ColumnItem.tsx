import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import './ColumnItem.scss';
import Icon from 'components/Icon/Icon';

function ColumnItem(props: any) {
  return (
    <Draggable draggableId={props.data} index={props.index}>
      {(provided) => (
        <div
          className='ColumnItem__container'
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <span className='ColumnItem__toggle'>
            <Icon name='eye-show-outline' />
          </span>
          <div>
            <span className='ColumnItem__name'>{props.data}</span>
            <span
              className='ColumnItem__drag__icon'
              {...provided.dragHandleProps}
            >
              <Icon name='drag' />
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default React.memo(ColumnItem);
