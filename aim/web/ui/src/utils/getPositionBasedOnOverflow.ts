import { PopoverPosition } from '@material-ui/core';

function getPositionBasedOnOverflow(
  activePointRect: { top: number; bottom: number; left: number; right: number },
  popoverRect: DOMRect,
  containerRect: DOMRect,
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
  if (activePointRect.left < containerRect.left) {
    // left bound case
    left = activePointRect.right + gap;
  } else if (activePointRect.right + popoverRect.width > containerRect.right) {
    // right bound case
    left = activePointRect.left - popoverRect.width - gap;
  } else {
    left = activePointRect.right + gap;
  }

  if (activePointRect.top < containerRect.top) {
    // top bound case
    top = containerRect.top + gap;
  } else if (activePointRect.top + popoverRect.height > containerRect.bottom) {
    // bottom bound case
    top = containerRect.bottom - popoverRect.height - gap;
  } else {
    top = activePointRect.top + gap;
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
