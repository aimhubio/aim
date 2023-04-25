import React from 'react';
import { DraggingStyle } from 'react-beautiful-dnd';

import type { ItemComponentProps, GetStyleProps } from './';

function ItemComponent({
  provided,
  item,
  style = {},
  isDragging = false,
  marginBottom = 0,
}: ItemComponentProps) {
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

export default ItemComponent;

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
