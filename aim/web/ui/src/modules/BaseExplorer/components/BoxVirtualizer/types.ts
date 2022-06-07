import React from 'react';
export interface IScrollEndCallbackObject {
  canvasWidth: number;
  canvasHeight: number;
  canvasScrollLeft: number;
  canvasScrollTop: number;
  isScrolledToLeftEnd: boolean;
  isScrolledToBottomEnd: boolean;
}

export type IScrollEndCallback = (
  canvasSpaces: IScrollEndCallbackObject,
) => void;

export interface ICoordinatesMap {
  x: string;
  y: string;
  width: string;
  height: string;
  opacity?: string;
  // isVisible
  // zIndex
  // ...
}

export interface BoxVirtualizerProps {
  data: any;
  coordinatesMap: ICoordinatesMap;
  visualizableContent: React.FC;
  isVirtualized?: boolean;
  viewportHeight?: string;
  viewportWidth?: string;
  boxGap?: number;
  scrollEndCallback?: IScrollEndCallback;
  leftScrollPos?: number;
  topScrollPos?: number;
}

export interface BoxProps {
  boxData: any;
  visualizableContent: React.FC;
  gap: number;
}

export interface ICanvasSize {
  width: number;
  height: number;
}

export interface IViewportProps {
  viewportHeight: number;
  viewportWidth: number;
  scrollLeft: number;
  scrollTop: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IRectangle {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export type TimeoutID = { id: number | null };

export interface IScrollToOptions {
  left?: number;
  top?: number;
  behavior?: 'auto' | 'smooth' | 'instant';
}
