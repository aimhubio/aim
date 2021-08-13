import { CurveEnum } from 'utils/d3';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import {
  IActivePoint,
  ISyncHoverStateParams,
} from 'types/utils/d3/drawHoverAttributes';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

export interface ILine {
  key: string;
  data: {
    xValues: number[];
    yValues: number[];
  };
  color: string;
  dasharray: string;
  selectors: string[];
}

export interface ILineChartProps {
  index: number;
  data: ILine[];
  xAlignment?: 'step' | 'absolute_time' | 'relative_time' | 'epoch';
  displayOutliers: boolean;
  zoomMode: boolean;
  axesScaleType: IAxesScaleState;
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  syncHoverState: (params: ISyncHoverStateParams) => void;
}

export interface IUpdateFocusedChartProps {
  mousePos: [number, number];
  focusedStateActive?: boolean;
  force?: boolean;
}

export interface IAttributesRef {
  focusedState?: IFocusedState;
  activePoint?: IActivePoint;
  xStep?: number;
  lineKey?: string;
  xScale?: IGetAxisScale;
  yScale?: IGetAxisScale;
  updateScales?: (xScale: IGetAxisScale, yScale: IGetAxisScale) => void;
  setActiveLine?: (lineKey: string) => void;
  updateHoverAttributes?: (xValue: number) => void;
  updateFocusedChart?: (params?: IUpdateFocusedChartProps) => void;
  clearHoverAttributes?: () => void;
}
