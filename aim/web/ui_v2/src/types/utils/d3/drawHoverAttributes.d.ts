import React from 'react';
import { ILineChartProps } from 'components/LineChart/LineChart';
import { IProcessedData } from './processData';
import { IAttributesRef } from 'components/LineChart/LineChart';
import { IGetAxisScale } from './getAxisScale';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import {
  IAggregationConfig,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';

export interface IDrawHoverAttributesProps {
  index: number;
  data: IProcessedData[];
  visAreaRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<IAttributesRef>;
  plotBoxRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  xAxisLabelNodeRef: React.MutableRefObject<>;
  yAxisLabelNodeRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  xAlignment: ILineChartProps['xAlignment'];
  syncHoverState: (params: ISyncHoverStateParams) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
  aggregationConfig?: IAggregationConfig;
}

export interface ISyncHoverStateParams {
  activePoint: IActivePoint | null;
  dataSelector?: string;
  focusedStateActive?: boolean;
}

export type IAxisLineData = { x1: number; y1: number; x2: number; y2: number };

export interface IGetCoordinates {
  mouseX: number;
  mouseY: number;
}

export interface IGetCoordinatesProps {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IGetAxisScale;
  yScale: IGetAxisScale;
}

export interface INearestCircle {
  x: number;
  y: number;
  key: string;
  color: string;
}

export interface IActivePoint {
  key: string;
  xValue: number | string;
  yValue: number;
  xPos: number;
  yPos: number;
  chartIndex: number;
  topPos: number;
  leftPos: number;
}
