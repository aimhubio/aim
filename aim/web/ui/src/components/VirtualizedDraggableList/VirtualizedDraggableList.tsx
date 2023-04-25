import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { FixedSizeList } from 'react-window';

import { ItemComponent, Row } from './';
import type { Item, VirtualizedDraggableListProps } from './';

function VirtualizedDraggableList(props: VirtualizedDraggableListProps) {
  const {
    itemSize = 24,
    width = '100%',
    height = 200,
    itemMarginBottom = 4,
    items: itemsProp = [],
    onDragEnd: onDragEndProp,
    isDropDisabled = false,
    cloneStyle = {},
  } = props;
  const [items, setItems] = React.useState<Item[]>(itemsProp);

  React.useEffect(() => {
    setItems(itemsProp);
  }, [itemsProp]);

  function onDragEnd(result: DropResult) {
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

  function onDragStart() {
    document.body.style.cursor = 'grab';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
  }

  function onDragUpdate() {
    document.body.style.cursor = 'grabbing';
  }

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
    >
      <div className='VirtualizedDraggableList'>
        <Droppable
          isDropDisabled={isDropDisabled}
          droppableId='droppable'
          mode='virtual'
          renderClone={(provided, snapshot, rubric) => (
            <ItemComponent
              style={cloneStyle}
              marginBottom={itemMarginBottom}
              provided={provided}
              isDragging={snapshot.isDragging}
              item={items[rubric.source.index]}
            />
          )}
        >
          {(provided) => (
            <FixedSizeList
              className={'ScrollBar__hidden'}
              height={height}
              itemCount={items.length}
              itemSize={itemSize}
              width={width}
              outerRef={provided.innerRef}
              itemData={items}
            >
              {Row}
            </FixedSizeList>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

VirtualizedDraggableList.displayName = 'VirtualizedDraggableList';
export default React.memo(VirtualizedDraggableList);

function reorder(list: Item[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
