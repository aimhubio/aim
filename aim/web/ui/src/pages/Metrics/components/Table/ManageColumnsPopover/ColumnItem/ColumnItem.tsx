import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import { Icon } from 'components/kit';

import './ColumnItem.scss';

function ColumnItem(props: any) {
  return (
    <Draggable draggableId={props.data} index={props.index}>
      {(provided) => (
        <div
          className={classNames('ColumnItem__container', {
            highlighted:
              props.hasSearchableItems &&
              !!props.searchKey &&
              props.searchKey.trim() !== '' &&
              props.data.includes(props.searchKey),
          })}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <span onClick={props.onClick} className='ColumnItem__toggle'>
            <Icon
              name={props.isHidden ? 'eye-outline-hide' : 'eye-show-outline'}
            />
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
