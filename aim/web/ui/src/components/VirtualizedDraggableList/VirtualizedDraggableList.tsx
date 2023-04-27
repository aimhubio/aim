import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { VariableSizeList } from 'react-window';

import { Box } from 'components/kit_v2';

import useVirtualizedDraggableList from './useVirtualizedDraggableList';

import { VirtualizeDraggableListRow, VirtualizeDraggableListItem } from './';
import type { VirtualizedDraggableListProps } from './';

function VirtualizedDraggableList(props: VirtualizedDraggableListProps) {
  const {
    items,
    onDragEnd,
    onDragStart,
    onDragUpdate,
    itemSize,
    width,
    height,
    itemMarginBottom,
    isDropDisabled,
    isDragDisabled,
    cloneStyle,
  } = useVirtualizedDraggableList(props);

  const itemData = React.useMemo(
    () => ({
      data: items,
      disabled: isDragDisabled,
    }),
    [items, isDragDisabled],
  );
  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
    >
      <Box width='100%' className='VirtualizedDraggableList'>
        <Droppable
          isDropDisabled={isDropDisabled}
          droppableId='droppable'
          mode='virtual'
          renderClone={(provided, snapshot, rubric) => (
            <VirtualizeDraggableListItem
              style={cloneStyle}
              marginBottom={itemMarginBottom}
              provided={provided}
              isDragging={snapshot.isDragging}
              item={items[rubric.source.index]}
            />
          )}
        >
          {(provided) => (
            <VariableSizeList
              className='ScrollBar__hidden'
              height={Math.min(items.length * itemSize, height)}
              itemCount={items.length}
              itemSize={() => itemSize}
              width={width}
              outerRef={provided.innerRef}
              itemData={itemData}
            >
              {VirtualizeDraggableListRow}
            </VariableSizeList>
          )}
        </Droppable>
      </Box>
    </DragDropContext>
  );
}

VirtualizedDraggableList.displayName = 'VirtualizedDraggableList';
export default React.memo(VirtualizedDraggableList);
