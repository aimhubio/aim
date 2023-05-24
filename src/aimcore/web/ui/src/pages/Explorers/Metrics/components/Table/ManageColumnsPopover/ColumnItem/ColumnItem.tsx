import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import shortenRunPropLabel from 'utils/shortenRunPropLabel';

import { IColumnItemProps } from './ColumnItem.d';

import './ColumnItem.scss';

function ColumnItem({
  searchKey,
  label,
  hasSearchableItems = false,
  draggingItemId,
  isHidden,
  popoverWidth,
  data,
  appName,
  index,
  onClick,
}: IColumnItemProps) {
  const [mounted, setMounted] = React.useState(false);
  const nameRef = React.useRef<HTMLParagraphElement | null>(null);
  function isHighlighted() {
    if (
      hasSearchableItems &&
      !!searchKey &&
      searchKey.trim() !== '' &&
      (label.toLowerCase().includes(searchKey.toLowerCase()) ||
        data.toLowerCase().includes(searchKey.toLowerCase()))
    ) {
      return true;
    }
    return false;
  }

  React.useEffect(() => {
    if (nameRef.current) {
      setMounted(true);
    }
  }, []);

  const itemDetails = React.useMemo(() => {
    let disableTooltip = true;
    let formattedValue = label;

    if (nameRef.current) {
      const { shortenValue, isFits } = shortenRunPropLabel(
        label,
        nameRef.current.clientWidth,
      );
      disableTooltip = isFits;
      formattedValue = shortenValue;
    }
    return {
      formattedValue,
      value: label,
      disableTooltip,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, popoverWidth, nameRef.current, mounted]);

  const isNonHidable: boolean =
    TABLE_DEFAULT_CONFIG[appName]?.nonHidableColumns.has(data);

  return (
    <ErrorBoundary>
      <Draggable draggableId={data} index={index}>
        {(provided) => (
          <Tooltip
            disableHoverListener={itemDetails.disableTooltip}
            arrow
            placement='left'
            title={itemDetails.value}
          >
            <div
              className={classNames('ColumnItem', {
                highlighted: isHighlighted(),
                dragging: draggingItemId === data,
              })}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <span
                onClick={isNonHidable ? _.noop : onClick}
                className={classNames('ColumnItem__toggle', {
                  disabled: isNonHidable,
                  isHidden: isHidden,
                })}
              >
                <Icon
                  name={isHidden ? 'eye-outline-hide' : 'eye-show-outline'}
                />
              </span>
              <div>
                <p ref={nameRef} className='ColumnItem__name fac'>
                  <Text size={14} className='ColumnItem__name' tint={100}>
                    {itemDetails.formattedValue}
                  </Text>
                </p>
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
