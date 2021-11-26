import React from 'react';
import { isEqual } from 'lodash-es';

import { Popover, PopoverPosition } from '@material-ui/core';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';

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

  function onPopoverPositionChange(
    hoveredElemRect: IChartPopover['hoveredElemRect'],
  ): void {
    if (hoveredElemRect === null) {
      setPopoverPos(null);
    } else if (popoverNode && containerNode) {
      // Popover viewport need to be overflowed by chart container
      const pos = getPositionBasedOnOverflow(
        hoveredElemRect,
        popoverNode.getBoundingClientRect(),
        containerNode.getBoundingClientRect(),
      );

      if (!isEqual(popoverPos, pos)) {
        setPopoverPos(pos);
      }
    }
  }

  React.useEffect(() => {
    if (open && props.hoveredElemRect) {
      onPopoverPositionChange(props.hoveredElemRect);
    }
  }, [
    open,
    containerNode,
    popoverNode,
    props.hoveredElemRect,
    props.tooltipContent,
    props.focusedState.key,
    props.focusedState.active,
  ]);

  return (
    <Popover
      key={`popover-${props.reCreatePopover}`}
      id={id}
      open={!!props.hoveredElemRect && open}
      disableEnforceFocus={true}
      anchorReference='anchorPosition'
      anchorPosition={popoverPos || props.hoveredElemRect || undefined}
      className={`ChartPopover ${className}`}
      transitionDuration={{
        appear: 0,
        enter: 200,
        exit: 200,
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
      <PopoverContent
        chartType={props.chartType}
        tooltipContent={props.tooltipContent}
        focusedState={props.focusedState}
        alignmentConfig={props.alignmentConfig}
      />
    </Popover>
  );
}

export default React.memo(ChartPopover);
