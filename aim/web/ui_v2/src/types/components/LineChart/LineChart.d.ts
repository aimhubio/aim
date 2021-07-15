import { CurveEnum } from 'utils/d3';
import HighlightEnum from '../../../components/HighlightModesPopover/HighlightEnum';

export type ScaleType = 'log' | 'linear';

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
  axisScaleType?: {
    x?: ScaleType;
    y?: ScaleType;
  };
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
}
