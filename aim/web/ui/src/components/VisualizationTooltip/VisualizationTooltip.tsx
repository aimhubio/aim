import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Popover, PopoverPosition } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import getPositionBasedOnOverflow from 'utils/getPositionBasedOnOverflow';

import { ElementRect, IVisualizationTooltipProps } from './';

import './VisualizationTooltip.scss';

function VisualizationTooltip(props: IVisualizationTooltipProps) {
  let {
    id = 'tooltip',
    forceOpen = false,
    open = false,
    className = '',
    containerNode = document.body,
    tooltipAppearance = TooltipAppearanceEnum.Auto,
    elementRect,
    children,
  } = props;
  open = forceOpen || open;

  const [openPopover, setOpenPopover] = React.useState<boolean>(
    !!elementRect && open,
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
    (elementRect: ElementRect) => {
      if (elementRect && popoverNode && containerNode) {
        // Popover viewport need to be overflowed by chart container
        const popoverRect = popoverNode.getBoundingClientRect();
        const containerRect = containerNode.getBoundingClientRect();

        if (containerRect.width && containerRect.height) {
          const posRect = {
            top: elementRect.top - containerNode.scrollTop,
            left: elementRect.left - containerNode.scrollLeft,
            right: elementRect.right - containerNode.scrollLeft,
            bottom: elementRect.bottom - containerNode.scrollTop,
          };

          const pos = getPositionBasedOnOverflow(
            posRect,
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
    setOpenPopover(!!elementRect && open);
  }, [elementRect, open]);

  React.useEffect(() => {
    if (!!elementRect && openPopover) {
      onPopoverPositionChange(elementRect);
    }
  }, [elementRect, openPopover, forceOpen, onPopoverPositionChange]);

  React.useEffect(() => {
    if (containerNode) {
      const onScrollEnd = _.debounce(
        () => setOpenPopover(!!elementRect && open),
        300,
      );
      const onScroll = _.debounce(
        () => {
          setOpenPopover(false);
        },
        200,
        {
          leading: true,
          trailing: false,
        },
      );

      containerNode.addEventListener('scroll', onScroll);
      containerNode.addEventListener('scroll', onScrollEnd);
      return () => {
        containerNode?.removeEventListener('scroll', onScroll);
        containerNode?.removeEventListener('scroll', onScrollEnd);
      };
    }
  }, [elementRect, open, containerNode]);

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
        className={classNames('VisualizationTooltip', {
          [className]: className,
          pinnedPopover: isPopoverPinned,
        })}
        transitionDuration={{ appear: 0, enter: 50, exit: 100 }}
        TransitionProps={{ onEnter: (node) => setPopoverNode(node) }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        classes={{
          paper: classNames('VisualizationTooltip__content', {
            VisualizationTooltip__content__active: forceOpen,
            VisualizationTooltip__content__pinned: isPopoverPinned,
            VisualizationTooltip__content__hide: !popoverPos,
          }),
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </Popover>
    </ErrorBoundary>
  );
}

export default React.memo(VisualizationTooltip);
