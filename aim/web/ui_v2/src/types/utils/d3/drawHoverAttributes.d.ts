import React from 'react';
import { IGetAxisScale } from './getAxesScale';
import { ILineChartProps } from '../../components/LineChart/LineChart';
import { IProcessedData } from './processData';

export interface IDrawHoverAttributesProps {
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxisScale['xScale'];
    yScale?: IGetAxisScale['yScale'];
    updateScales?: (
      xScale: IGetAxisScale['xScale'],
      yScale: IGetAxisScale['yScale'],
    ) => void;
    updateHoverAttributes?: (
      mousePosition: [number, number],
    ) => IActivePointData;
  }>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  index: number;
  callback: (
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ) => void;
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
  xScale?: IGetAxisScale['xScale'];
  yScale?: IGetAxisScale['yScale'];
}

export interface IGetNearestCirclesProps {
  data: IProcessedData[];
  xScale: IGetAxisScale['xScale'];
  yScale: IGetAxisScale['yScale'];
  mouseX: number;
  mouseY: number;
}

export interface IGetNearestCircles {
  nearestCircles: INearestCircle[];
  closestCircle: IClosestCircle;
}

export interface IActivePointData {
  key: string;
  xValue: number;
  yValue: number;
}
