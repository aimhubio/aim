import React from 'react';
import { Popover, PopoverPosition } from '@material-ui/core';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';
import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

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

  const onPopoverPositionChange = React.useCallback(
    (popoverPos: PopoverPosition | null): void => {
      if (popoverPos === null) {
        setPopoverPos(null);
      } else {
        // Popover viewport need to be overflowed by chart container
        const pos = getPositionBasedOnOverflow(
          popoverPos,
          containerRef?.current?.getBoundingClientRect(),
          popoverContentRef?.current?.getBoundingClientRect(),
        );

        setPopoverPos(pos);
      }
    },
    [containerRef, popoverContentRef],
  );

  React.useEffect(() => {
    onPopoverPositionChange(popoverPosition);
  }, [popoverPosition, onPopoverPositionChange]);

  return (
    <Popover
      id={id || 'popover'}
      open={!!popoverPos && open}
      disableEnforceFocus={true}
      anchorReference='anchorPosition'
      anchorPosition={popoverPos || undefined}
      className={`ChartPopover ${className}`}
      classes={{ paper: 'ChartPopover__content' }}
    >
      {children}
    </Popover>
  );
}

export default React.memo(ChartPopover);
