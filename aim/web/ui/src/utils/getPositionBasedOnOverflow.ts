import { PopoverPosition } from '@material-ui/core';

import { TooltipAppearance } from 'types/services/models/metrics/metricsAppModel.d';

function getPositionBasedOnOverflow(
  activePointRect: { top: number; bottom: number; left: number; right: number },
  popoverRect: DOMRect,
  containerRect: DOMRect,
  isPopoverPinned: boolean,
  tooltipAppearance: TooltipAppearance,
): PopoverPosition {
  if (!containerRect || !popoverRect) {
    return {
      top: activePointRect.top,
      left: activePointRect.left,
    };
  }
  let left;
  let top;

  const gap = 10;

  if (isPopoverPinned) {
    const anchorWidth = activePointRect.right - activePointRect.left;
    const anchorCenter = activePointRect.right - anchorWidth / 2;
    if (anchorCenter - popoverRect.width / 2 - gap < containerRect.left) {
      // left bound case
      left =
        activePointRect.right -
        (activePointRect.right - containerRect.left) +
        gap;
    } else if (anchorCenter + popoverRect.width / 2 > containerRect.right) {
      left =
        activePointRect.left -
        popoverRect.width +
        (containerRect.right - activePointRect.left);
    } else {
      left = anchorCenter - popoverRect.width / 2;
    }

    if (tooltipAppearance === TooltipAppearance.Top) {
      top = containerRect.top - (popoverRect.height - 30);
    } else {
      const pageBottom =
        document?.querySelector('body')?.getBoundingClientRect().bottom ?? 0;
      const topPosition = containerRect.bottom - 30;
      if (pageBottom < containerRect.bottom + popoverRect.height - 40) {
        top = pageBottom - popoverRect.height - gap;
      } else {
        top = topPosition;
      }
    }
  } else {
    if (activePointRect.left < containerRect.left) {
      // left bound case
      left = activePointRect.right + gap;
    } else if (
      activePointRect.right + popoverRect.width >
      containerRect.right
    ) {
      // right bound case
      left = activePointRect.left - popoverRect.width - gap;
    } else {
      left = activePointRect.right + gap;
    }

    if (activePointRect.top < containerRect.top) {
      // top bound case
      top = containerRect.top + gap;
    } else if (
      activePointRect.top + popoverRect.height >
      containerRect.bottom
    ) {
      // bottom bound case
      top = containerRect.bottom - popoverRect.height - gap;
    } else {
      top = activePointRect.top + gap;
    }
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
