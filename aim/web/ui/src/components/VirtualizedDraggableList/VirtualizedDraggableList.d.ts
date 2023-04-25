import React from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';

export type Item = { id: string; content: React.ReactNode };

export interface VirtualizedDraggableListProps {
  items: Item[];
  itemSize?: number;
  width?: number | string;
  height?: number | string;
  itemMarginBottom?: number;
  onDragEnd?: (result: Item['id'][]) => void;
  isDropDisabled?: boolean;
  cloneStyle?: CSSStyleDeclaration;
}

export interface ItemComponentProps {
  provided: DraggableProvided;
  item: Item;
  style?: {};
  isDragging?: boolean;
  marginBottom?: number;
}

export interface GetStyleProps {
  provided: DraggableProvided;
  style: {};
  isDragging: boolean;
  marginBottom: number;
}
