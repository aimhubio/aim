import { PopoverPosition } from '@material-ui/core';

function getPositionBasedOnOverflow(
  pos: PopoverPosition,
  containerRect?: DOMRect,
  popoverContentRect: DOMRect | { width: number; height: number } = {
    width: 230,
    height: 250,
  },
): PopoverPosition {
  if (!containerRect || !popoverContentRect) {
    return pos;
  }
  let left;
  let top;

  if (pos.left + popoverContentRect.width < containerRect.left) {
    left = containerRect.left;
  } else if (
    pos.left + popoverContentRect.width >
    containerRect.left + containerRect.width
  ) {
    left = pos.left - popoverContentRect.width - 30;
  } else {
    left = pos.left;
  }

  if (pos.top + popoverContentRect.height < containerRect.top) {
    top = containerRect.top - popoverContentRect.height;
  } else if (
    pos.top + popoverContentRect.height >
    containerRect.top + containerRect.height
  ) {
    top = containerRect.top + containerRect.height - popoverContentRect.height;
  } else {
    top = pos.top;
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
