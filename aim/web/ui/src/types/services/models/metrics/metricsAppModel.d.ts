import { GroupNameEnum } from 'config/grouping/GroupingPopovers';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import {
  IAppModelConfig,
  IGroupingConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  INotification,
  ISyntaxErrorDetails,
} from 'types/components/NotificationContainer/NotificationContainer';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import {
  AlignmentOptionsEnum,
  CurveEnum,
  ZoomEnum,
  LegendsModeEnum,
} from 'utils/d3';
import { IRequestProgress } from 'utils/app/setRequestProgress';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';

import { IMetric } from './metricModel';
import { IMetricTrace, IRun, ISequence } from './runModel';

export interface IMetricAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  queryIsEmpty: boolean;
  rawData: ISequence<IMetricTrace>[];
  config: IAppModelConfig;
  data: IMetricsCollection<IMetric>[];
  lineChartData: ILine[][];
  chartTitleData: IChartTitleData;
  aggregatedData: IAggregatedData[];
  legendsData: LegendsDataType;
  tooltip: ITooltip;
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  sortOptions: IGroupingSelectOption[];
  selectFormData?: {
    options: ISelectOption[];
    suggestions: string[];
    error: ISyntaxErrorDetails;
    advancedError: ISyntaxErrorDetails;
  };
  liveUpdateConfig: {
    delay: number;
    enabled: boolean;
  };
  selectedRows?: any;
}

export interface IChartTitleData {
  [key: string]: IChartTitle;
}

export interface IChartTitle {
  [key: string]: string;
}

export interface IAggregatedData extends IAggregationData {
  key?: string;
  color: string;
  dasharray: string;
  chartIndex: number;
}

export interface ITooltipContent {
  groupConfig?: Record<string, any>;
  name?: string;
  context?: Record<string, any>;
  runHash?: string;
  caption?: string;
  step?: number | string;
  index?: number;
  images_name?: string;
  selectedProps?: Record<string, any>;
  run?: IRun;
}

export enum TooltipAppearance {
  Top = 'top',
  Auto = 'auto',
  Bottom = 'bottom',
}

export interface ITooltipConfig {
  appearance: TooltipAppearance;
  display: boolean;
  selectedFields: string[];
}

export interface ITooltip extends Partial<ITooltipConfig> {
  content?: ITooltipContent;
}

export interface LegendsConfig {
  display: boolean;
  mode: LegendsModeEnum;
}

export interface IMetricsCollection<T> {
  key?: string;
  groupKey?: string;
  config: Record<string, unknown> | null;
  color: string | null;
  dasharray: string | null;
  chartIndex: number;
  data: T[];
  aggregation?: IAggregationData;
}

export interface IAggregationData {
  area: {
    min: {
      xValues: number[];
      yValues: number[];
    } | null;
    max: {
      xValues: number[];
      yValues: number[];
    } | null;
    stdDevValue?: {
      xValues: number[];
      yValues: number[];
    };
    stdErrValue?: {
      xValues: number[];
      yValues: number[];
    };
  };
  line: {
    xValues: number[];
    yValues: number[];
  } | null;
}

export interface IChartZoom {
  active: boolean;
  mode: ZoomEnum;
  history: {
    index: number;
    xValues: [number, number];
    yValues: [number, number];
  }[];
}

export interface IAlignmentConfig {
  metric?: string;
  type: AlignmentOptionsEnum;
}

export interface IAggregationConfig {
  methods: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  };
  isApplied: boolean;
  isEnabled: boolean;
}

export interface IFocusedState {
  active: boolean;
  key: string | null;
  xValue?: number | string | null;
  yValue?: number | string | null;
  chartIndex?: number | null;
}

export interface IMetricTableRowData {
  key: string;
  dasharray: metric.dasharray;
  color: metric.color;
  experiment: metric.run.experiment_name;
  run: metric.run.name;
  metric: metric.metric_name;
  context: string[];
  value: string;
  step: string;
  epoch: string;
  time: number | null;
  [key: string]: any;
}

export interface IOnGroupingSelectChangeParams {
  groupName: GroupNameEnum;
  list: string[];
}

export interface IOnGroupingModeChangeParams {
  groupName: GroupNameEnum;
  value: boolean;
  options?: any[] | null;
}

export interface IGetGroupingPersistIndex {
  groupConfig: {};
  grouping: IGroupingConfig;
  groupName: 'color' | 'stroke';
}

export interface IGroupingSelectOption {
  label: string;
  group: string;
  value: string;
  readonly?: boolean;
}

export interface IAppData {
  created_at?: string;
  id?: string;
  updated_at?: string;
  type?: string;
  state?: Partial<IAppModelConfig | IImagesExploreAppConfig>;
}

export interface IDashboardRequestBody {
  name: string;
  description: string;
  app_id?: string;
}

export interface IDashboardData {
  app_id: string;
  created_at: string;
  id: string;
  name: string;
  description: string;
  updated_at: string;
}

export interface IAlignMetricsDataParams {
  align_by: string;
  runs: {
    run_id: string;
    traces: {
      context: IMetricTrace['context'];
      metric_name: string;
      slice: number[];
    }[];
  }[];
}

export interface ISmoothing {
  algorithm: SmoothingAlgorithmEnum;
  factor: number;
  curveInterpolation: CurveEnum;
  isApplied: boolean;
}

export interface LegendColumnDataType {
  color?: string;
  dasharray?: string;
  chartIndex?: number;
  value: string;
}

export interface LegendsDataType {
  [key: string]: Record<string, LegendColumnDataType[]>;
}
