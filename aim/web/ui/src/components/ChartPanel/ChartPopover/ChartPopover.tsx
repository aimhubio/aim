import React from 'react';

import { Popover, PopoverPosition } from '@material-ui/core';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';

import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

import './ChartPopover.scss';

function ChartPopover(props: IChartPopover): JSX.Element | null {
  const {
    id = 'popover',
    open = false,
    className = '',
    containerNode = document.body,
  } = props;
  const [popoverPos, setPopoverPos] = React.useState<PopoverPosition | null>(
    null,
  );
  const [popoverNode, setPopoverNode] = React.useState<HTMLElement>();

  const onPopoverPositionChange = React.useCallback(
    (activePointRect: IChartPopover['activePointRect']) => {
      if (activePointRect === null) {
        setPopoverPos(null);
      } else if (popoverNode && containerNode) {
        // Popover viewport need to be overflowed by chart container
        const pos = getPositionBasedOnOverflow(
          activePointRect,
          popoverNode.getBoundingClientRect(),
          containerNode.getBoundingClientRect(),
        );

        setPopoverPos(pos);
      }
    },
    [containerNode, popoverNode],
  );

  React.useEffect(() => {
    if (open && props.activePointRect) {
      onPopoverPositionChange(props.activePointRect);
    }
  }, [
    open,
    containerNode,
    popoverNode,
    props.activePointRect,
    props.tooltipContent,
    props.focusedState.key,
    props.focusedState.active,
    onPopoverPositionChange,
  ]);

  return (
    <ErrorBoundary>
      <Popover
        key={`popover-${props.reCreatePopover}`}
        id={id}
        open={!!props.activePointRect && open}
        disableEnforceFocus={true} // the trap focus will not prevent focus from leaving the trap focus while open
        disableAutoFocus={true} // the trap focus will not automatically shift focus to itself when it opens
        disableRestoreFocus={true} // the trap focus will not restore focus to previously focused element once trap focus is hidden
        anchorReference='anchorPosition'
        anchorPosition={popoverPos || props.activePointRect || undefined}
        className={`ChartPopover ${className}`}
        transitionDuration={{
          appear: 0,
          enter: 50,
          exit: 100,
        }}
        TransitionProps={{
          onEnter: (node) => {
            setPopoverNode(node);
          },
        }}
        classes={{
          paper: `ChartPopover__content ${
            props.focusedState?.active ? 'ChartPopover__content__active' : ''
          }`,
        }}
      >
        <ErrorBoundary>
          <PopoverContent
            chartType={props.chartType}
            tooltipContent={props.tooltipContent}
            focusedState={props.focusedState}
            alignmentConfig={props.alignmentConfig}
          />
        </ErrorBoundary>
      </Popover>
    </ErrorBoundary>
  );
}

export default React.memo(ChartPopover);
