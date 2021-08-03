import React from 'react';
import { ILineChartProps } from 'components/LineChart/LineChart';
import { IProcessedData } from './processData';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IAttributesRef } from '../../components/LineChart/LineChart';
import { IGetAxisScale } from './getAxisScale';

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
  syncHoverState: (params: ISyncHoverStateParams | null) => void;
  highlightedNodeRef: React.MutableRefObject<>;
  highlightMode: HighlightEnum;
}

export interface ISyncHoverStateParams {
  activePoint: IActivePoint;
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
  xValue: number;
  yValue: number;
  pageX: number;
  pageY: number;
  xPos: number;
  yPos: number;
  chartIndex: number;
}
