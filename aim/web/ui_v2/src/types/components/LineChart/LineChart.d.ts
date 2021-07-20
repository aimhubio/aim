import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import { IAxesScaleState } from '../AxesScalePopover/AxesScalePopover';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

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
  onMouseOver: (
    mousePosition: [number, number],
    activePointData: IActivePointData,
  ) => void;
  axesScaleType: IAxesScaleState;
  highlightMode: HighlightEnum;
  curveInterpolation: CurveEnum;
}
