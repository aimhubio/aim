import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IOnSmoothingChange } from 'Metrics';
import { CurveEnum } from 'utils/d3';
import {
  IAggregationConfig,
  IAlignmentConfig,
  IChartTooltip,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IControlProps {
  selectOptions: IGroupingSelectOption[];
  tooltip: IChartTooltip;
  displayOutliers: boolean;
  zoomMode: boolean;
  highlightMode: HighlightEnum;
  aggregationConfig: IAggregationConfig;
  axesScaleType: IAxesScaleState;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  curveInterpolation: CurveEnum;
  alignmentConfig: IAlignmentConfig;
  onChangeTooltip: (tooltip: Partial<IChartTooltip>) => void;
  onDisplayOutliersChange: () => void;
  onHighlightModeChange: (mode: number) => void;
  onSmoothingChange: (props: IOnSmoothingChange) => void;
  onAxesScaleTypeChange: (params: IAxesScaleState) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
  onZoomModeChange: () => void;
  onAlignmentTypeChange: IMetricProps['onAlignmentTypeChange'];
  onAlignmentMetricChange: IMetricProps['onAlignmentMetricChange'];
}
