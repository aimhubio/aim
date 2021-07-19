import React from 'react';
import { IGetAxesScale } from './getAxesScale';
import { ILineChartProps } from '../../components/LineChart/LineChart';
import { IProcessedData } from './processData';

export interface IDrawHoverAttributesProps {
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxesScale['xScale'];
    yScale?: IGetAxesScale['yScale'];
    updateScales?: (
      xScale: IGetAxesScale['xScale'],
      yScale: IGetAxesScale['yScale'],
    ) => void;
    updateHoverAttributes?: (
      event?: MouseEvent,
      mousePosition?: number[],
    ) => void;
  }>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  index: number;
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
  xScale?: IGetAxesScale['xScale'];
  yScale?: IGetAxesScale['yScale'];
}

export interface IGetNearestCirclesProps {
  data: IProcessedData[];
  xScale: IGetAxesScale['xScale'];
  yScale: IGetAxesScale['yScale'];
  mouseX: number;
  mouseY: number;
}

export interface IGetNearestCircles {
  nearestCircles: INearestCircle[];
  closestCircle: IClosestCircle;
}
