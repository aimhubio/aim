import React from 'react';
import { IGetAxisScale, IGetAxisScaleProps } from './getAxesScale';

export interface IDrawBrushProps extends IGetAxisScaleProps {
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
  xValues: IGetAxisScale['xScale'];
  yValues: IGetAxisScale['yScale'];
  mousePosition: number[];
}
