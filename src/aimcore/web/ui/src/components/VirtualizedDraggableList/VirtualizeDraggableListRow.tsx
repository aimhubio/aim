import React from 'react';
import { areEqual, ListChildComponentProps } from 'react-window';
import { Draggable } from 'react-beautiful-dnd';

import type { Item } from './';
import { VirtualizeDraggableListItem } from './';

function VirtualizeDraggableListRow(
  props: ListChildComponentProps<{ data: Item[]; disabled: boolean }>,
) {
  const {
    data: { data: items, disabled },
    index,
    style,
  } = props;
  const item = items[index];
  return (
    <Draggable
      isDragDisabled={disabled}
      draggableId={item.id}
      index={index}
      key={item.id}
    >
      {(provided) => (
        <VirtualizeDraggableListItem
          provided={provided}
          item={item}
          style={style}
        />
      )}
    </Draggable>
  );
}

export default React.memo(VirtualizeDraggableListRow, areEqual);
