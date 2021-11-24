import React from 'react';

import { Popover, PopoverPosition } from '@material-ui/core';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';

import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

import './ChartPopover.scss';

function ChartPopover(props: IChartPopover): JSX.Element | null {
  const { id = 'popover', open = false, className = '' } = props;
  const [popoverPos, setPopoverPos] = React.useState<PopoverPosition | null>(
    null,
  );
  const popoverContentRef = React.useRef<HTMLDivElement>(null);
  const frameIDRef = React.useRef<number>(0);

  function onPopoverPositionChange(popoverPos: PopoverPosition | null): void {
    if (popoverPos === null) {
      setPopoverPos(null);
    } else if (popoverContentRef.current && props.containerRef?.current) {
      // Popover viewport need to be overflowed by chart container
      const pos = getPositionBasedOnOverflow(
        popoverPos,
        props.containerRef.current.getBoundingClientRect(),
        popoverContentRef.current.getBoundingClientRect(),
      );

      setPopoverPos(pos);
    }
  }

  // on mount stage
  React.useEffect(() => {
    frameIDRef.current = window.requestAnimationFrame(() => {
      onPopoverPositionChange(props.popoverPosition);
    });

    return () => {
      window.cancelAnimationFrame(frameIDRef.current);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (open && props.popoverPosition) {
      frameIDRef.current = window.requestAnimationFrame(() => {
        onPopoverPositionChange(props.popoverPosition);
      });
    }
  }, [
    props.popoverPosition,
    props.containerRef?.current,
    props.tooltipContent,
    props.focusedState?.key,
    popoverContentRef?.current,
    open,
  ]);

  return (
    <Popover
      id={id}
      open={!!props.popoverPosition && open}
      disableEnforceFocus={true}
      anchorReference='anchorPosition'
      anchorPosition={popoverPos || props.popoverPosition || undefined}
      className={`ChartPopover ${className}`}
      classes={{
        paper: `ChartPopover__content${popoverPos ? '' : '__hide'} ${
          props.focusedState?.active ? 'ChartPopover__content__active' : ''
        }`,
      }}
    >
      <PopoverContent
        ref={popoverContentRef}
        chartType={props.chartType}
        tooltipContent={props.tooltipContent}
        focusedState={props.focusedState}
        alignmentConfig={props.alignmentConfig}
      />
    </Popover>
  );
}

export default React.memo(ChartPopover);
