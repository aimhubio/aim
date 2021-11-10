import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IChartTooltip,
  IChartZoom,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IChartTooltip;
  ignoreOutliers: boolean;
  zoom?: IChartZoom;
  highlightMode: HighlightEnum;
  axesScaleType: IAxesScaleState;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onHighlightModeChange: (mode: number) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
}
