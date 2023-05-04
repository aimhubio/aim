import { TooltipAppearanceEnum } from '../modules/BaseExplorer/components/Controls/ConfigureTooltip';

function getPositionBasedOnOverflow(
  posRect: { top: number; bottom: number; left: number; right: number },
  popoverRect: DOMRect,
  containerRect: DOMRect,
  isPopoverPinned: boolean,
  tooltipAppearance: TooltipAppearanceEnum,
): { top: number; left: number } {
  if (!containerRect || !popoverRect) {
    return {
      top: posRect.top,
      left: posRect.left,
    };
  }
  let left;
  let top;

  const gap = 10;

  if (isPopoverPinned) {
    const anchorWidth = posRect.right - posRect.left;
    const anchorCenter = posRect.right - anchorWidth / 2;
    if (anchorCenter - popoverRect.width / 2 - gap < containerRect.left) {
      // left bound case
      left = posRect.right - (posRect.right - containerRect.left) + gap;
    } else if (anchorCenter + popoverRect.width / 2 > containerRect.right) {
      left =
        posRect.left - popoverRect.width + (containerRect.right - posRect.left);
    } else {
      left = anchorCenter - popoverRect.width / 2;
    }

    if (tooltipAppearance === TooltipAppearanceEnum.Top) {
      top = containerRect.top - (popoverRect.height - 30);
    } else {
      const pageBottom = document.body.getBoundingClientRect().bottom ?? 0;
      const topPosition = containerRect.bottom - 30;
      if (pageBottom < containerRect.bottom + popoverRect.height - 40) {
        top = pageBottom - popoverRect.height - gap;
      } else {
        top = topPosition;
      }
    }
  } else {
    if (posRect.left < containerRect.left) {
      // left bound case
      left =
        (posRect.right < containerRect.left
          ? containerRect.left
          : posRect.right) + gap;
    } else if (
      posRect.right + 2 * gap + popoverRect.width >=
      containerRect.right
    ) {
      // right bound case
      left = posRect.left - popoverRect.width - gap;
    } else {
      left = posRect.right + gap;
    }

    if (posRect.top < containerRect.top) {
      // top bound case
      top = containerRect.top + gap;
    } else if (posRect.top + popoverRect.height > containerRect.bottom) {
      // bottom bound case
      top = containerRect.bottom - popoverRect.height - gap;
    } else {
      top = posRect.top + gap;
    }
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
