import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { DensityOptions } from 'config/enums/densityEnum';

import { AppDataTypeEnum, AppNameEnum } from 'services/models/explorer';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IAggregationConfig,
  IAlignmentConfig,
  IChartTooltip,
  IChartZoom,
  IFocusedState,
  IMetricAppModelState,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IParamsAppModelState } from 'types/services/models/params/paramsAppModel';
import { IRunsAppModelState } from 'types/services/models/runs/runsAppModel';

import { ChartTypeEnum, CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

export interface IAppInitialConfig {
  dataType: AppDataTypeEnum;
  selectForm: AppNameEnum;
  grouping: boolean;
  appName: AppNameEnum;
  components: {
    table?: boolean;
    charts?: ChartTypeEnum[];
  };
}

export type IAppModelState =
  | IMetricAppModelState
  | IParamsAppModelState
  | IRunsAppModelState;

export interface IAppModelConfig {
  grouping?: IGroupingConfig;
  select?: ISelectConfig;
  table?: ITableConfig;
  pagination?: IPaginationConfig;
  liveUpdate?: ILiveUpdateConfig;
  chart?: Partial<IChart>;
}

export interface IChart
  extends ILineChartConfig,
    IHighPlotConfig,
    IScatterPlotConfig {}

export interface IGroupingConfig {
  color?: string[];
  stroke?: string[];
  chart?: string[];
  group?: [];
  reverseMode?: {
    color: boolean;
    stroke: boolean;
    chart: boolean;
  };
  isApplied?: {
    color: boolean;
    stroke: boolean;
    chart: boolean;
  };
  persistence?: {
    color: boolean;
    stroke: boolean;
  };
  seed?: {
    color: number;
    stroke: number;
  };
  paletteIndex?: number;
}

export interface ISelectOption {
  label: string;
  group: string;
  color: string;
  type?: string;
  value?: {
    option_name: string;
    context: { [key: string]: unknown } | null | any;
  };
}

export interface ISelectConfig {
  options: ISelectOption[];
  query: string;
  advancedMode?: boolean;
  advancedQuery?: string;
}

export interface ITableConfig {
  resizeMode: ResizeModeEnum;
  rowHeight: RowHeightSize;
  sortFields?: SortField[];
  hiddenMetrics?: string[];
  hiddenColumns?: string[];
  columnsWidths?: { [key: string]: number };
  columnsOrder?: {
    left: string[];
    middle: string[];
    right: string[];
  };
  height: string;
}

export interface IPaginationConfig {
  limit: number;
  offset: null;
  isLatest: boolean;
}

export interface ILiveUpdateConfig {
  delay: number;
  enabled: boolean;
}

export interface IHighPlotConfig {
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  focusedState: IFocusedState;
  tooltip: IChartTooltip;
}

export interface ILineChartConfig {
  highlightMode: HighlightEnum;
  ignoreOutliers: boolean;
  zoom: IChartZoom;
  axesScaleType: IAxesScaleState;
  curveInterpolation: CurveEnum;
  smoothingAlgorithm: SmoothingAlgorithmEnum;
  smoothingFactor: number;
  aggregationConfig: IAggregationConfig;
  densityType: DensityOptions;
  alignmentConfig: IAlignmentConfig;
  focusedState: IFocusedState;
  tooltip: IChartTooltip;
}

export interface IScatterPlotConfig {
  highlightMode: HighlightEnum;
  focusedState: IFocusedState;
  tooltip: IChartTooltip;
}
