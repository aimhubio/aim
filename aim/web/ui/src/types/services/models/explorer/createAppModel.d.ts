import { AppDataTypeEnum, AppNameEnum } from 'services/models/explorer';

import { ChartTypeEnum, CurveEnum } from 'utils/d3';

import {
  IAggregationConfig,
  IAlignmentConfig,
  IChartTooltip,
  IChartZoom,
  IFocusedState,
  IMetricAppModelState,
  SortField,
} from '../metrics/metricsAppModel';
import { IParamsAppModelState } from '../params/paramsAppModel';
import { IRunsAppModelState } from '../runs/runsAppModel';
import { ResizeModeEnum } from '../../../../config/enums/tableEnums';
import { RowHeightSize } from '../../../../config/table/tableConfigs';
import { HighlightEnum } from '../../../../components/HighlightModesPopover/HighlightModesPopover';
import { IAxesScaleState } from '../../../components/AxesScalePopover/AxesScalePopover';
import { SmoothingAlgorithmEnum } from '../../../../utils/smoothingData';
import { DensityOptions } from '../../../../config/enums/densityEnum';

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
  ignoreOutliers: boolean;
  zoom: IChartZoom;
  axesScaleType: IAxesScaleState;
  curveInterpolation: CurveEnum;
  focusedState: IFocusedState;
  tooltip: IChartTooltip;
}
