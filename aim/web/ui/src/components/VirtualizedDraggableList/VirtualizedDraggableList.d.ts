import React from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';

export type Item = { id: string; content: React.ReactNode };

export interface VirtualizedDraggableListProps {
  items: Item[];
  itemSize?: number;
  width?: number | string;
  height?: number;
  itemMarginBottom?: number;
  isDropDisabled?: boolean;
  isDragDisabled?: boolean;
  cloneStyle?: CSSStyleDeclaration;
  onDragEnd?: (result: Item['id'][]) => void;
  onDragStart?: () => void;
  onDragUpdate?: () => void;
}

export interface VirtualizeDraggableListItemProps {
  provided: DraggableProvided;
  item: Item;
  style?: {};
  isDragging?: boolean;
  marginBottom?: number;
  disabled?: boolean;
}

export interface GetStyleProps {
  provided: DraggableProvided;
  style: {};
  isDragging: boolean;
  marginBottom: number;
}
