import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

import {
  IAppModelConfig,
  IGroupingConfig,
} from 'services/models/explorer/createAppModel';

import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { AlignmentOptionsEnum } from 'utils/d3';

import { IMetric } from './metricModel';
import { IMetricTrace, IRun } from './runModel';

export interface IMetricAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestIsPending: boolean;
  queryIsEmpty: boolean;
  rawData: IRun<IMetricTrace>[];
  config: IAppModelConfig;
  data: IMetricsCollection<IMetric>[];
  lineChartData: ILine[][];
  chartTitleData: IChartTitleData;
  aggregatedData: IAggregatedData[];
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  liveUpdateConfig: {
    delay: number;
    enabled: boolean;
  };
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

export interface ITooltipData {
  [key: string]: ITooltipContent;
}

export interface ITooltipContent {
  groupConfig?: {
    [key: string]: any;
  };
  params?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IMetricsCollection<T> {
  key?: string;
  groupKey?: string;
  config: { [key: string]: string } | null;
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
  };
  line: {
    xValues: number[];
    yValues: number[];
  } | null;
}

export type SortField = [string, 'asc' | 'desc'];

export interface IChartZoom {
  active: boolean;
  mode: ZoomEnum;
  history: {
    index: number;
    xValues: [number, number];
    yValues: [number, number];
  }[];
}

export interface IPanelTooltip {
  content: ITooltipContent;
  display: boolean;
  selectedParams: string[];
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

export interface IGetDataAsLinesProps {
  smoothingFactor?: number;
  smoothingAlgorithm?: string;
  collection?: IMetric[][];
}

export interface IOnGroupingSelectChangeParams {
  groupName: GroupNameType;
  list: string[];
}

export interface IOnGroupingModeChangeParams {
  groupName: GroupNameType;
  value: boolean;
  options?: any[] | null;
}

export interface IGetGroupingPersistIndex {
  groupConfig: {};
  grouping: IGroupingConfig;
  groupName: 'color' | 'stroke';
}

export type GroupNameType = 'color' | 'stroke' | 'chart' | 'group';
export interface IGroupingSelectOption {
  label: string;
  group: string;
  value: string;
}

export interface IAppData {
  created_at?: string;
  id?: string;
  updated_at?: string;
  type?: string;
  state?: Partial<IAppModelConfig>;
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
