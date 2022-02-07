import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IActivePoint,
  INearestCircle,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import {
  IAggregatedData,
  IAggregationConfig,
  IAlignmentConfig,
  IChartTitle,
  IChartZoom,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

export interface ILine {
  key: string;
  data: {
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray?: string;
  selectors?: string[];
  groupKey?: string;
}

export interface ILineChartProps {
  index: number;
  data: ILine[];
  aggregatedData?: IAggregatedData[];
  alignmentConfig?: IAlignmentConfig;
  ignoreOutliers: boolean;
  axesScaleType: IAxesScaleState;
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  syncHoverState: (args: ISyncHoverStateArgs) => void;
  aggregationConfig?: IAggregationConfig;
  chartTitle?: IChartTitle;
  zoom?: IChartZoom;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
}

export interface IUpdateFocusedChartArgs {
  mousePos?: [number, number];
  focusedStateActive?: boolean;
  force?: boolean;
}

export interface IBrushRef {
  updateScales?: (xScale: IAxisScale, yScale: IAxisScale) => void;
  xScale?: IAxisScale;
  yScale?: IAxisScale;
  handleZoomIn?: (xValues: [number, number], yValues: [number, number]) => void;
}

export interface IAttributesRef {
  focusedState?: IFocusedState;
  activePoint?: IActivePoint;
  nearestCircles?: INearestCircle[];
  xStep?: number;
  lineKey?: string;
  dataSelector?: string;
  xScale?: IAxisScale;
  yScale?: IAxisScale;
  updateScales?: (xScale: IAxisScale, yScale: IAxisScale) => void;
  setActiveLineAndCircle?: (
    lineKey: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ) => void;
  updateHoverAttributes?: (xValue: number, dataSelector?: string) => void;
  updateFocusedChart?: (args?: IUpdateFocusedChartArgs) => void;
  clearHoverAttributes?: () => void;
}
