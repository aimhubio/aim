import React from 'react';
import { IGetAxisScale } from './getAxesScale';
import { ILineChartProps } from '../../components/LineChart/LineChart';
import { IProcessedData } from './processData';

export interface IDrawHoverAttributesProps {
  index: number;
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
    updateHoverAttributes?: (mouse: [number, number]) => void;
  }>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  closestCircleRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: number;
  renderChartRef: React.MutableRefObject<any>;
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
