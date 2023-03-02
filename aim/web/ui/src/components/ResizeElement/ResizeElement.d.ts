import React from 'react';
import { HeightProperty, WidthProperty } from 'csstype';

import { ResizableSideEnum } from './';

export interface ResizeElementProps {
  id?: string;
  children: React.ReactNode;
  side?: ResizableSideEnum;
  gutterSize?: number;
  snapOffset?: number;
  useLocalStorage?: boolean;
  initialSizes: {
    width?: WidthProperty<string | number>;
    height?: HeightProperty<string | number>;
    maxWidth: number;
    maxHeight: number;
  };
  onResizeStart?: (
    resizeElement: React.RefObject<HTMLElement>,
    gutterSize: number,
  ) => void;
  onResize?: (
    resizeElement: React.RefObject<HTMLElement>,
    gutterSize: number,
  ) => void;
  onResizeEnd?: (
    resizeElement: React.RefObject<HTMLElement>,
    gutterSize: number,
  ) => void;
}
