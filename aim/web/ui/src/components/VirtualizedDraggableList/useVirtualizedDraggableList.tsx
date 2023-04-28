import React from 'react';
import {
  DragStart,
  DragUpdate,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';

import type { Item } from '.';
import { VirtualizedDraggableListProps } from '.';

function useVirtualizedDraggableList(props: VirtualizedDraggableListProps) {
  const {
    items: itemsProp = [],
    onDragEnd: onDragEndProp,
    onDragStart: onDragStartProp,
    onDragUpdate: onDragUpdateProp,
    itemSize = 24,
    width = '100%',
    height = 120,
    itemMarginBottom = 4,
    isDropDisabled = false,
    isDragDisabled = false,
    cloneStyle = {},
  } = props;
  const [items, setItems] = React.useState<Item[]>(itemsProp);

  React.useEffect(() => {
    setItems(itemsProp);
  }, [itemsProp]);

  function onDragEnd(result: DropResult, provided: ResponderProvided) {
    document.body.style.userSelect = 'unset';
    document.body.style.pointerEvents = 'unset';
    document.body.style.cursor = 'unset';
    if (!result.destination) {
      return;
    }
    if (result.source.index === result.destination.index) {
      return;
    }
    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index,
    );
    if (typeof onDragEndProp === 'function') {
      const newIds = newItems.map((item) => item.id);
      onDragEndProp(newIds);
    }
    setItems(newItems);
  }

  function onDragStart(initial: DragStart, provided: ResponderProvided) {
    document.body.style.cursor = 'grab';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
    if (typeof onDragStartProp === 'function') {
      onDragStartProp();
    }
  }

  function onDragUpdate(initial: DragUpdate, provided: ResponderProvided) {
    document.body.style.cursor = 'grabbing';
    if (typeof onDragUpdateProp === 'function') {
      onDragUpdateProp();
    }
  }

  return {
    ...props,
    itemSize,
    width,
    height,
    itemMarginBottom,
    isDropDisabled,
    isDragDisabled,
    cloneStyle,
    items,
    onDragEnd,
    onDragStart,
    onDragUpdate,
  };
}

export default useVirtualizedDraggableList;

function reorder(list: Item[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
