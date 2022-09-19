import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import { IColumnItemProps } from './ColumnItem.d';

import './ColumnItem.scss';

const CharSize = 6;

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
    let maxChars: number = 0;
    let disableTooltip = true;
    if (nameRef.current) {
      maxChars = nameRef.current.clientWidth / CharSize;
    }
    let splitVal = label.split('.');

    if (splitVal.length > 2) {
      let isFits = maxChars >= label.length;
      return {
        formattedValue: isFits
          ? label
          : `${splitVal[0]}.~.${splitVal[splitVal.length - 1]}`,
        value: label,
        disableTooltip: isFits,
      };
    }
    return {
      formattedValue: label,
      value: label,
      disableTooltip,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, popoverWidth, nameRef.current, mounted]);

  const isNonHidable: boolean =
    TABLE_DEFAULT_CONFIG[appName as AppNameEnum]?.nonHidableColumns.has(data);

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
