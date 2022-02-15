import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import './ColumnItem.scss';

function ColumnItem(props: any) {
  return (
    <ErrorBoundary>
      <Draggable draggableId={props.data} index={props.index}>
        {(provided) => (
          <div
            className={classNames('ColumnItem', {
              highlighted:
                props.hasSearchableItems &&
                !!props.searchKey &&
                props.searchKey.trim() !== '' &&
                props.data.includes(props.searchKey),
              dragging: props.draggingItemId === props.data,
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
              <Text tint={100} className='ColumnItem__name'>
                {isSystemMetric(props.data)
                  ? formatSystemMetricName(props.data)
                  : props.data}
              </Text>
              <span
                className='ColumnItem__iconDrag'
                {...provided.dragHandleProps}
              >
                <Icon name='drag' />
              </span>
            </div>
          </div>
        )}
      </Draggable>
    </ErrorBoundary>
  );
}

export default React.memo(ColumnItem);
