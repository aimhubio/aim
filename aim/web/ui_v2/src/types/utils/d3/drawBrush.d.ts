import React from 'react';
import { IGetAxesScale, IGetAxesScaleProps } from './getAxesScale';

export interface IDrawBrushProps extends IGetAxesScaleProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
}

export interface IHandleBrushChange {
  xValues: IGetAxesScale['xScale'];
  yValues: IGetAxesScale['yScale'];
  mousePos: number[];
}
