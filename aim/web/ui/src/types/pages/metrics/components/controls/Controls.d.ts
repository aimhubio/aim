import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IOnSmoothingChange } from 'Metrics';
import { CurveEnum } from 'utils/d3';
import {
  IAggregationConfig,
  IAlignmentConfig,
  IChartTooltip,
  IChartZoom,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IMetricProps } from 'types/pages/metrics/Metrics';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import { DensityOptions } from 'config/enums/densityEnum';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IChartTooltip;
  ignoreOutliers: boolean;
  zoom?: IChartZoom;
  highlightMode: HighlightEnum;
  aggregationConfig: IAggregationConfig;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  curveInterpolation: CurveEnum;
  alignmentConfig: IAlignmentConfig;
  densityType: DensityOptions;
  projectsDataMetrics: IProjectParamsMetrics['metrics'];
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onHighlightModeChange: (mode: number) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
  onAlignmentTypeChange: IMetricProps['onAlignmentTypeChange'];
  onAlignmentMetricChange: IMetricProps['onAlignmentMetricChange'];
}
