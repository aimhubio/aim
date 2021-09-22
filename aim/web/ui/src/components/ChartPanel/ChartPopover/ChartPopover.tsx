import React, { useRef } from 'react';
import { Popover, PopoverPosition } from '@material-ui/core';
import { isEqual } from 'lodash-es';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';

import './ChartPopover.scss';

function ChartPopover({
  id,
  popoverPosition,
  open = false,
  className = '',
  children,
  containerRef,
  popoverContentRef,
}: IChartPopover): JSX.Element | null {
  const [popoverPos, setPopoverPos] = React.useState<PopoverPosition | null>(
    null,
  );

  const getPositionBasedOnOverflow = React.useCallback(
    (pos: PopoverPosition, containerRect: DOMRect): PopoverPosition => {
      let left;
      let top;

      if (
        pos.left + (popoverContentRef?.current?.offsetWidth || 0) <
        containerRect.left
      ) {
        left = containerRect.left;
      } else if (
        pos.left + (popoverContentRef?.current?.offsetWidth || 0) >
        containerRect.left +
          containerRect.width -
          (popoverContentRef?.current?.offsetWidth || 0)
      ) {
        left =
          containerRect.left +
          containerRect.width -
          (popoverContentRef?.current?.offsetWidth || 0);
      } else {
        left = pos.left;
      }

      if (
        pos.top + (popoverContentRef?.current?.offsetHeight || 0) <
        containerRect.top
      ) {
        top =
          containerRect.top - (popoverContentRef?.current?.offsetHeight || 0);
      } else if (
        pos.top + (popoverContentRef?.current?.offsetHeight || 0) >
        containerRect.top + containerRect.height
      ) {
        top =
          containerRect.top +
          containerRect.height -
          (popoverContentRef?.current?.offsetHeight || 0);
      } else {
        top = pos.top;
      }

      return {
        left,
        top,
      };
    },
    [
      popoverContentRef?.current?.offsetHeight,
      popoverContentRef?.current?.offsetWidth,
    ],
  );

  const onPopoverPositionChange = React.useCallback(
    (popoverPos: PopoverPosition | null): void => {
      if (popoverPos === null) {
        setPopoverPos(null);
      } else {
        // Popover viewport need to be overflowed by chart container
        const containerRect = containerRef?.current?.getBoundingClientRect();
        const pos = containerRect
          ? getPositionBasedOnOverflow(popoverPos, containerRect)
          : popoverPos;

        setPopoverPos((prevState) => {
          if (isEqual(prevState, pos)) {
            return prevState;
          }
          return pos;
        });
      }
    },
    [containerRef, getPositionBasedOnOverflow],
  );

  React.useEffect(() => {
    onPopoverPositionChange(popoverPosition);
  }, [popoverPosition, onPopoverPositionChange]);

  return !!popoverPos ? (
    <Popover
      id={id || 'popover'}
      open={open}
      disableEnforceFocus={true}
      anchorReference='anchorPosition'
      anchorPosition={popoverPos}
      className={`ChartPopover ${className}`}
      classes={{ paper: 'ChartPopover__content' }}
    >
      {children}
    </Popover>
  ) : null;
}

export default React.memo(ChartPopover);
