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
    setActiveLine: (lineKey: string, index: number) => void;
    clearLinesAndAttributes: () => void;
  }>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  closestCircleRef: React.MutableRefObject<INearestCircle | null>;
  activeLineKeyRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  onMouseOver: (
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ) => void;
  onMouseLeave: (index: number) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
  hasFocusedCircleRef: React.MutableRefObject<boolean>;
  focusedState: {
    key: string | null;
    xValue: number | null;
    yValue: number | null;
    active: boolean;
    chartIndex: number | null;
  };
}

export type IAxisLineData = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinatesProps {
  mouse: [number, number];
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
  r?: number;
}

export interface ISetAxisLabelProps {
  closestCircle: INearestCircle;
  xScale?: IGetAxesScale['xScale'];
  yScale?: IGetAxesScale['yScale'];
}

export interface IGetNearestCirclesProps {
  xScale: IGetAxesScale['xScale'];
  yScale: IGetAxesScale['yScale'];
  mouseX: number;
  mouseY: number;
}

export interface IGetNearestCircles {
  nearestCircles: INearestCircle[];
  closestCircle: INearestCircle;
}

export interface IActivePointData {
  key: string;
  xValue: number;
  yValue: number;
  pageX: number;
  pageY: number;
  chartIndex: number;
}
