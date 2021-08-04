import {
  IActivePoint,
  ISyncHoverStateParams,
} from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import { IAxesScaleState } from '../AxesScalePopover/AxesScalePopover';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IGetAxisScale } from '../../utils/d3/getAxisScale';
import { IFocusedState } from '../../services/models/metrics/metricsAppModel';

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
  xAlignment?: 'absolute_time' | 'relative_time' | 'epoch';
  displayOutliers: boolean;
  zoomMode: boolean;
  axesScaleType: IAxesScaleState;
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
  syncHoverState: (params: ISyncHoverStateParams) => void;
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
  updateFocusedChart?: (mousePos: [number, number]) => IActivePoint;
  clearHoverAttributes?: () => void;
}
