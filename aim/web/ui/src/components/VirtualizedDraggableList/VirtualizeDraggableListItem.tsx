import React from 'react';
import { DraggingStyle } from 'react-beautiful-dnd';

import type { VirtualizeDraggableListItemProps, GetStyleProps } from './';

function VirtualizeDraggableListItem({
  provided,
  item,
  style = {},
  isDragging = false,
  marginBottom = 0,
}: VirtualizeDraggableListItemProps) {
  return (
    <div
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={getStyle({
        provided,
        style,
        isDragging,
        marginBottom,
      })}
      className={`item ${isDragging ? 'is-dragging' : ''}`}
    >
      {item.content}
    </div>
  );
}

export default VirtualizeDraggableListItem;

function getStyle({
  provided,
  style,
  isDragging,
  marginBottom = 0,
}: GetStyleProps) {
  const combined = {
    ...style,
    ...provided.draggableProps.style,
  } as DraggingStyle;

  return {
    ...combined,
    height: isDragging ? combined.height : combined.height - marginBottom,
    marginBottom,
  };
}
