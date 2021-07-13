import React from 'react';
import { IGetAxisScale } from './getAxesScale';

export interface IDrawBrushProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  handleBrushChange: (props: IHandleBrushChange) => void;
}

export interface IHandleBrushChange {
  xValues: IGetAxisScale['xScale'];
  yValues: IGetAxisScale['yScale'];
  mousePosition: number[];
}
