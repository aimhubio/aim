import { PopoverPosition } from '@material-ui/core';

function getPositionBasedOnOverflow(
  hoveredElemRect: { top: number; left: number; right: number },
  popoverRect: DOMRect,
  containerRect: DOMRect,
): PopoverPosition {
  if (!containerRect || !popoverRect) {
    return {
      top: hoveredElemRect.top,
      left: hoveredElemRect.left,
    };
  }
  let left;
  let top;

  if (hoveredElemRect.left < containerRect.left) {
    // left bound case
    left = hoveredElemRect.right;
  } else if (hoveredElemRect.right + popoverRect.width > containerRect.right) {
    // right bound case
    left = hoveredElemRect.left - popoverRect.width;
  } else {
    left = hoveredElemRect.right;
  }

  if (hoveredElemRect.top < containerRect.top) {
    // top bound case
    top = containerRect.top;
  } else if (hoveredElemRect.top + popoverRect.height > containerRect.bottom) {
    // bottom bound case
    top = containerRect.bottom - popoverRect.height;
  } else {
    top = hoveredElemRect.top;
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
