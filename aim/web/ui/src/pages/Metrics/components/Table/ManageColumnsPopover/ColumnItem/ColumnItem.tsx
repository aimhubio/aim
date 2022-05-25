import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

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

  const isNonHidable: boolean = TABLE_DEFAULT_CONFIG[
    props.appName as AppNameEnum
  ]?.nonHidableColumns.has(props.data);

  return (
    <ErrorBoundary>
      <Draggable draggableId={props.data} index={props.index}>
        {(provided) => (
          <div
            className={classNames('ColumnItem', {
              highlighted: isHighlighted(),
              dragging: props.draggingItemId === props.data,
            })}
            {...provided.draggableProps}
            ref={provided.innerRef}
          >
            <span
              onClick={isNonHidable ? null : props.onClick}
              className={classNames('ColumnItem__toggle', {
                disabled: isNonHidable,
              })}
            >
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
