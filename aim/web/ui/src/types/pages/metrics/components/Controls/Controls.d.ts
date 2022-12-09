import { ILine } from 'components/LineChart/LineChart';

import { DensityOptions } from 'config/enums/densityEnum';

import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IAxesScaleRange } from 'types/components/AxesPropsPopover/AxesPropsPopover';
import {
  IAggregationConfig,
  IAlignmentConfig,
  ITooltip,
  IChartZoom,
  IGroupingSelectOption,
  ISmoothing,
  LegendsDataType,
  LegendsConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

import { ChartTypeEnum, HighlightEnum } from 'utils/d3';

export interface IControlProps {
  chartProps: any[];
  chartType: ChartTypeEnum;
  data: ILine[][] | any;
  legendsData?: LegendsDataType;
  selectOptions: IGroupingSelectOption[];
  tooltip?: ITooltip;
  legends?: LegendsConfig;
  ignoreOutliers: boolean;
  zoom?: IChartZoom;
  highlightMode: HighlightEnum;
  aggregationConfig: IAggregationConfig;
  axesScaleType: IAxesScaleState;
  axesScaleRange: IAxesScaleRange;
  smoothing: ISmoothing;
  alignmentConfig: IAlignmentConfig;
  densityType: DensityOptions;
  selectFormOptions: ISelectOption[];
  onChangeTooltip: (tooltip: Partial<ITooltip>) => void;
  onIgnoreOutliersChange: () => void;
  onLegendsChange: (legends: Partial<LegendsConfig>) => void;
  onHighlightModeChange: (mode: number) => void;
  onDensityTypeChange: (type: DensityOptions) => void;
  onSmoothingChange: (args: Partial<ISmoothing>) => void;
  onAxesScaleTypeChange: (args: IAxesScaleState) => void;
  onAggregationConfigChange: (
    aggregationConfig: Partial<IAggregationConfig>,
  ) => void;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
  onAlignmentTypeChange: IMetricProps['onAlignmentTypeChange'];
  onAlignmentMetricChange: IMetricProps['onAlignmentMetricChange'];
  onAxesScaleRangeChange: IMetricProps['onAxesScaleRangeChange'];
}
