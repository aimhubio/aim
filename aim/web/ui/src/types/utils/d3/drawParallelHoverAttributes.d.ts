import React from 'react';

import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import { IGetAxisScale } from './getAxisScale';
import { ILineValuesDataType } from './drawParallelLines';
import { IDimensionsType } from './drawParallelAxes';
import {
  ISyncHoverStateParams,
  INearestCircle,
  IActivePoint,
} from './drawHoverAttributes';

export interface IDrawParallelHoverAttributesProps {
  index: number;
  dimensions: IDimensionsType;
  visAreaRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<{
    xScale?: IGetAxisScale;
    yScale?: IGetAxisScale;
    x: number;
    y: number;
    updateScales?: (xScale: IGetAxisScale, yScale: IGetAxisScale) => void;
    updateHoverAttributes?: (mousePosition: [number, number]) => void;
    setActiveLine: (lineKey: string) => void;
    yColorIndicatorScale: d3.ScaleSequential;
    mousePosition: number[];
    activePoint?: IActivePoint;
    lineKey?: string;
    focusedState?: IFocusedState;
    updateFocusedChart: (params: IUpdateParallelFocusedChartProps) => void;
    clearHoverAttributes: () => void;
    setActiveLineAndCircle?: (
      lineKey: string,
      focusedStateActive: boolean,
      force: boolean,
    ) => void;
  }>;
  syncHoverState: (params: ISyncHoverStateParams) => void;
  linesNodeRef: React.MutableRefObject<>;
  highlightedNodeRef: React.MutableRefObject<>;
  isVisibleColorIndicator: boolean;
}

export interface IParallelClosestCircle {
  key: string;
  r: number | null;
  x: number;
  y: number;
  values: ILineValuesDataType;
  color: string;
}
export interface IUpdateParallelFocusedChartProps {
  mouse?: [number, number];
  focusedStateActive?: boolean;
  force?: boolean;
}

export interface IParallelNearestCircle extends INearestCircle {
  lastYScalePos?: number;
  values?: ILineValuesDataType;
}
