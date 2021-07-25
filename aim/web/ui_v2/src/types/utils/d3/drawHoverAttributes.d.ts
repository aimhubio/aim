import React from 'react';
import { IGetAxesScale } from './getAxesScale';
import { ILineChartProps } from 'components/LineChart/LineChart';
import { IProcessedData } from './processData';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

export interface IDrawHoverAttributesProps {
  index: number;
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxesScale['xScale'];
    yScale?: IGetAxesScale['yScale'];
    x: number;
    y: number;
    updateScales?: (
      xScale: IGetAxesScale['xScale'],
      yScale: IGetAxesScale['yScale'],
    ) => void;
    updateHoverAttributes?: (
      mousePosition: [number, number],
    ) => IActivePointData;
    setActiveLine: (lineKey: string) => void;
  }>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  closestCircleRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  index: number;
  callback: (
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
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

export interface IActivePointData {
  key: string;
  xValue: number;
  yValue: number;
}
