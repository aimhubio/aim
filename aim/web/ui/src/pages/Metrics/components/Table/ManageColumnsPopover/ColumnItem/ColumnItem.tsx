import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import './ColumnItem.scss';
const CharSize = 6;
function ColumnItem(props: any) {
  const [mounted, setMounted] = React.useState(false);
  const nameRef = React.useRef<HTMLParagraphElement | null>(null);
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
    let value: string = isSystemMetric(props.data)
      ? formatSystemMetricName(props.data)
      : props.data;
    let splitVal = value.split('.');

    if (splitVal.length > 2) {
      let isFits = maxChars >= value.length;
      return {
        formattedValue: isFits
          ? value
          : `${splitVal[0]}.~.${splitVal[splitVal.length - 1]}`,
        value,
        disableTooltip: isFits,
      };
    }
    return {
      formattedValue: value,
      value,
      disableTooltip,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data, props.popoverWidth, nameRef.current, mounted]);

  const isNonHidable: boolean = TABLE_DEFAULT_CONFIG[
    props.appName as AppNameEnum
  ]?.nonHidableColumns.has(props.data);

  return (
    <ErrorBoundary>
      <Draggable draggableId={props.data} index={props.index}>
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
                  name={
                    props.isHidden ? 'eye-outline-hide' : 'eye-show-outline'
                  }
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
