import React from 'react';

import { IPoint } from 'components/ScatterPlot';

import { ILine, IAttributesRef } from 'types/components/LineChart/LineChart';
import {
  IAggregationConfig,
  IAlignmentConfig,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';

import { ScaleEnum, HighlightEnum } from 'utils/d3';

import { IAxisScale } from './getAxisScale';
import { IProcessedData } from './processLineChartData';

export type HoverAttrData = ILine | IPoint;

export interface IDrawHoverAttributesArgs {
  index?: number;
  id: string;
  nameKey: string;
  data: HoverAttrData[];
  processedData?: IProcessedData[];
  axesScaleType: { xAxis: ScaleEnum; yAxis: ScaleEnum };
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<IAttributesRef>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  xAxisLabelNodeRef?: React.MutableRefObject<>;
  yAxisLabelNodeRef?: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  syncHoverState?: (params: ISyncHoverStateParams) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode?: HighlightEnum;
  aggregationConfig?: IAggregationConfig;
  alignmentConfig?: IAlignmentConfig;
  drawAxisLines?: { x: Boolean; y: Boolean };
  drawAxisLabels?: { x: Boolean; y: Boolean };
}

export interface ISyncHoverStateArgs {
  activePoint: IActivePoint | null;
  dataSelector?: string;
  focusedState?: IFocusedState;
}

export type IAxisLineData = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinates {
  mouseX: number;
  mouseY: number;
}

export interface IGetCoordinatesArgs {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IAxisScale;
  yScale: IAxisScale;
}

export interface INearestCircle {
  x: number;
  y: number;
  key: string;
  color: string;
  inProgress?: boolean;
}

export interface IActivePoint {
  key: string;
  xValue: number | string;
  yValue: number | string;
  xPos: number;
  yPos: number;
  chartIndex: number;
  visId: string;
  inProgress?: boolean;
  pointRect: IActivePointRect | null;
  rect: IActiveElementRect;
}

export interface IActivePointRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface IActiveElementRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
