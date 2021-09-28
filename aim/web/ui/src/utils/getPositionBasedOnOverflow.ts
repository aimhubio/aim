import { PopoverPosition } from '@material-ui/core';

function getPositionBasedOnOverflow(
  pos: PopoverPosition,
  containerRect: DOMRect,
  contentRect: DOMRect,
): PopoverPosition {
  if (!containerRect || !contentRect) {
    return pos;
  }
  let left;
  let top;

  if (pos.left + contentRect.width < containerRect.left) {
    left = containerRect.left;
  } else if (
    pos.left + contentRect.width >
    containerRect.left + containerRect.width
  ) {
    left = pos.left - contentRect.width - 30;
  } else {
    left = pos.left;
  }

  if (pos.top + contentRect.height < containerRect.top) {
    top = containerRect.top - contentRect.height;
  } else if (
    pos.top + contentRect.height >
    containerRect.top + containerRect.height
  ) {
    top = containerRect.top + containerRect.height - contentRect.height;
  } else {
    top = pos.top;
  }

  return {
    left,
    top,
  };
}

export default getPositionBasedOnOverflow;
