import React from 'react';
import { IGetAxisScale } from './getAxesScale';
import { ILineChartProps } from '../../components/LineChart/LineChart';
import { IProcessedData } from './processData';

export interface IDrawHoverAttributesProps {
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  xScale: IGetAxisScale['xScale'];
  yScale: IGetAxisScale['yScale'];
  xAlignment: ILineChartProps['xAlignment'];
}

export type IAxisLineData = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinatesProps {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IDrawHoverAttributesProps['xScale'];
  yScale: IDrawHoverAttributesProps['yScale'];
}

export interface IGetCoordinates {
  mouseX: number;
  mouseY: number;
}

export interface INearestCircle {
  x: number;
  y: number;
  key: string;
  color: string;
}

export interface IClosestCircle {
  key: string;
  r: number | null;
  x: number;
  y: number;
}

export interface ISetAxisLabelProps extends Partial<IDrawHoverAttributesProps> {
  closestCircle: IClosestCircle;
}
