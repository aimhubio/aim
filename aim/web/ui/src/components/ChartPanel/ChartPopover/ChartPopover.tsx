import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Popover, PopoverPosition } from '@material-ui/core';

import PopoverContent from 'components/ChartPanel/PopoverContent/PopoverContent';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { IChartPopover } from 'types/components/ChartPanel/ChartPopover';
import { IActivePointRect } from 'types/utils/d3/drawHoverAttributes';

import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

import './ChartPopover.scss';

function ChartPopover(props: IChartPopover): JSX.Element {
  let {
    id = 'popover',
    forceOpen = false,
    open = false,
    className = '',
    containerNode = document.body,
    selectOptions,
    tooltipAppearance = TooltipAppearanceEnum.Auto,
  } = props;
  open = forceOpen || open;

  const [openPopover, setOpenPopover] = React.useState<boolean>(
    !!props.activePointRect && open,
  );
  const [popoverNode, setPopoverNode] = React.useState<HTMLElement>();
  const [popoverPos, setPopoverPos] = React.useState<PopoverPosition>({
    top: 10000,
    left: 10000,
  });

  const isPopoverPinned = React.useMemo(
    () =>
      tooltipAppearance === TooltipAppearanceEnum.Top ||
      tooltipAppearance === TooltipAppearanceEnum.Bottom,
    [tooltipAppearance],
  );

  const onPopoverPositionChange = React.useCallback(
    (activePointRect: IActivePointRect) => {
      if (popoverNode && containerNode) {
        // Popover viewport need to be overflowed by chart container
        const popoverRect = popoverNode.getBoundingClientRect();
        const containerRect = containerNode.getBoundingClientRect();

        if (containerRect.width && containerRect.height) {
          const activePointPos = {
            top: activePointRect.top - containerNode.scrollTop,
            left: activePointRect.left - containerNode.scrollLeft,
            right: activePointRect.right - containerNode.scrollLeft,
            bottom: activePointRect.bottom - containerNode.scrollTop,
          };

          const pos = getPositionBasedOnOverflow(
            activePointPos,
            popoverRect,
            containerRect,
            isPopoverPinned,
            tooltipAppearance,
          );
          setPopoverPos(pos);
        }
      }
    },
    [containerNode, popoverNode, isPopoverPinned, tooltipAppearance],
  );

  React.useEffect(() => {
    setOpenPopover(!!props.activePointRect && open);
  }, [props.activePointRect, open]);

  React.useEffect(() => {
    if (!!props.activePointRect && openPopover) {
      onPopoverPositionChange(props.activePointRect);
    }
  }, [
    props.activePointRect,
    openPopover,
    props.tooltipContent,
    props.focusedState.key,
    props.focusedState.active,
    onPopoverPositionChange,
  ]);

  React.useEffect(() => {
    if (containerNode) {
      const onScrollEnd = _.debounce(
        () => setOpenPopover(!!props.activePointRect && open),
        300,
      );
      const onScroll = _.debounce(() => setOpenPopover(false), 200, {
        leading: true,
        trailing: false,
      });
      containerNode.addEventListener('scroll', onScroll);
      containerNode.addEventListener('scroll', onScrollEnd);
      return () => {
        containerNode?.removeEventListener('scroll', onScroll);
        containerNode?.removeEventListener('scroll', onScrollEnd);
      };
    }
  }, [props.activePointRect, open, containerNode]);

  React.useEffect(() => {
    const onMouseMove = ({ target }: any) => {
      if (
        !forceOpen &&
        !containerNode?.contains(target) &&
        !popoverNode?.contains(target)
      ) {
        setOpenPopover(false);
      }
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [containerNode, popoverNode, forceOpen]);

  return (
    <ErrorBoundary>
      <Popover
        key={`popover-${tooltipAppearance}`}
        id={id}
        open={openPopover}
        disableEnforceFocus={true} // the trap focus will not prevent focus from leaving the trap focus while open
        disableAutoFocus={true} // the trap focus will not automatically shift focus to itself when it opens
        disableRestoreFocus={true} // the trap focus will not restore focus to previously focused element once trap focus is hidden
        disablePortal={true} // do not freeze app on scroll
        disableScrollLock={true} // do not freeze app on scroll
        anchorReference='anchorPosition'
        anchorPosition={popoverPos}
        className={classNames('ChartPopover', {
          [className]: className,
          pinnedPopover: isPopoverPinned,
        })}
        transitionDuration={{
          appear: 0,
          enter: 50,
          exit: 100,
        }}
        TransitionProps={{
          onEnter: (node) => setPopoverNode(node),
        }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        classes={{
          paper: classNames('ChartPopover__content', {
            ChartPopover__content__active: props.focusedState?.active,
            ChartPopover__content__pinned: isPopoverPinned,
            hide: !popoverPos,
          }),
        }}
      >
        <ErrorBoundary>
          <PopoverContent
            chartType={props.chartType}
            tooltipContent={props.tooltipContent}
            tooltipAppearance={props.tooltipAppearance}
            focusedState={props.focusedState}
            alignmentConfig={props.alignmentConfig}
            selectOptions={selectOptions}
            onRunsTagsChange={props.onRunsTagsChange}
            onChangeTooltip={props.onChangeTooltip}
          />
        </ErrorBoundary>
      </Popover>
    </ErrorBoundary>
  );
}

export default React.memo(ChartPopover);
