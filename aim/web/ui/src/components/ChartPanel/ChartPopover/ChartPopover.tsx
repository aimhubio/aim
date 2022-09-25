import React from 'react';
import classNames from 'classnames';

import { Popover, PopoverPosition } from '@material-ui/core';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';
import { TooltipAppearance } from 'types/services/models/metrics/metricsAppModel.d';

import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

import './ChartPopover.scss';

function ChartPopover(props: IChartPopover): JSX.Element {
  const {
    id = 'popover',
    open = false,
    className = '',
    containerNode = document.body,
    selectOptions,
    tooltipAppearance,
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

  const anchorPosition = React.useMemo(() => {
    if (
      tooltipAppearance === TooltipAppearance.Top ||
      tooltipAppearance === TooltipAppearance.Bottom
    ) {
      return { top: 0, left: 0 };
    } else if (popoverPos) {
      return popoverPos;
    } else if (props.activePointRect) {
      return props.activePointRect;
    }
    return undefined;
  }, [popoverPos, props.activePointRect, tooltipAppearance]);

  return (
    <ErrorBoundary>
      <Popover
        key={`popover-${props.reCreatePopover}`}
        id={id}
        open={!!props.activePointRect && open}
        disableEnforceFocus={true} // the trap focus will not prevent focus from leaving the trap focus while open
        disableAutoFocus={true} // the trap focus will not automatically shift focus to itself when it opens
        disableRestoreFocus={true} // the trap focus will not restore focus to previously focused element once trap focus is hidden
        disablePortal={true} // do not freeze app on scroll
        disableScrollLock={true} // do not freeze app on scroll
        anchorReference='anchorPosition'
        anchorPosition={anchorPosition}
        className={classNames('ChartPopover', {
          [className]: className,
          pinnedPopover:
            tooltipAppearance === TooltipAppearance.Top ||
            tooltipAppearance === TooltipAppearance.Bottom,
        })}
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
          paper: classNames('ChartPopover__content', {
            ChartPopover__content__active: props.focusedState?.active,
            ChartPopover__content__pinnedToTop:
              tooltipAppearance === TooltipAppearance.Top,
            ChartPopover__content__pinnedToBottom:
              tooltipAppearance === TooltipAppearance.Bottom,
          }),
        }}
      >
        <ErrorBoundary>
          <PopoverContent
            chartType={props.chartType}
            tooltipContent={props.tooltipContent}
            focusedState={props.focusedState}
            alignmentConfig={props.alignmentConfig}
            selectOptions={selectOptions}
            onRunsTagsChange={props.onRunsTagsChange}
          />
        </ErrorBoundary>
      </Popover>
    </ErrorBoundary>
  );
}

export default React.memo(ChartPopover);
