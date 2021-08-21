import React from 'react';
import { IGetAxesScaleProps, IGetAxisScale } from './getAxisScale';
import { ISyncHoverStateParams } from './drawHoverAttributes';

export interface IDrawBrushProps extends IGetAxesScaleProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
}

export interface IHandleBrushChange {
  xValues: IGetAxisScale;
  yValues: IGetAxisScale;
  mousePos: number[];
}
