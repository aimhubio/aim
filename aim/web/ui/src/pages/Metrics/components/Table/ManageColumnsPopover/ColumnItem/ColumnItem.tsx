import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import './ColumnItem.scss';

function ColumnItem(props: any) {
  function isHighlighted() {
    const data = isSystemMetric(props.data)
      ? formatSystemMetricName(props.data)
      : props.data;
    if (
      props.hasSearchableItems &&
      !!props.searchKey &&
      props.searchKey.trim() !== '' &&
      data.toLowerCase().includes(props.searchKey.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  const itemValue = React.useMemo(() => {
    const val: string = isSystemMetric(props.data)
      ? formatSystemMetricName(props.data)
      : props.data;
    let splitVal = val.split('.');
    if (splitVal.length > 2) {
      return `${splitVal[0]}.~.${splitVal[splitVal.length - 1]}`;
    }
    return val;
  }, [props.data]);
  return (
    <ErrorBoundary>
      <Draggable draggableId={props.data} index={props.index}>
        {(provided) => (
          <Tooltip
            arrow
            placement='left'
            title={
              isSystemMetric(props.data)
                ? formatSystemMetricName(props.data)
                : props.data
            }
          >
            <div
              className={classNames('ColumnItem', {
                highlighted: isHighlighted(),
                dragging: props.draggingItemId === props.data,
              })}
              {...provided.draggableProps}
              ref={provided.innerRef}
            >
              <span onClick={props.onClick} className='ColumnItem__toggle'>
                <Icon
                  name={
                    props.isHidden ? 'eye-outline-hide' : 'eye-show-outline'
                  }
                />
              </span>
              <div>
                <Text tint={100} className='ColumnItem__name'>
                  {itemValue}
                </Text>
                <span
                  className='ColumnItem__iconDrag'
                  {...provided.dragHandleProps}
                >
                  <Icon name='drag' />
                </span>
              </div>
            </div>
          </Tooltip>
        )}
      </Draggable>
    </ErrorBoundary>
  );
}

export default React.memo(ColumnItem);
