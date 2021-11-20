import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IChartTitle,
  IChartZoom,
} from 'types/services/models/metrics/metricsAppModel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';

export interface IScatterPlotProps {
  index: number;
  data: any;
  axesScaleType?: IAxesScaleState;
  chartTitle?: IChartTitle;
  displayOutliers?: boolean;
  highlightMode?: HighlightEnum;
  zoom?: IChartZoom;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
  syncHoverState: (args: ISyncHoverStateArgs) => void;
}
