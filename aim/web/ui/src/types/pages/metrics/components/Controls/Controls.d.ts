import { IOnSmoothingChange } from 'Metrics';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { ILine } from 'components/LineChart/LineChart';

import { DensityOptions } from 'config/enums/densityEnum';

import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IAggregationConfig,
  IAlignmentConfig,
  ITooltip,
  IChartZoom,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { ChartTypeEnum, CurveEnum } from 'utils/d3';

export interface IControlProps {
  chartProps: any[];
  chartType: ChartTypeEnum;
  data: ILine[][] | any;
  selectOptions: IGroupingSelectOption[];
  tooltip?: ITooltip;
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
  selectFormOptions: ISelectOption[];
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
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
