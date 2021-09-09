import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { CurveEnum } from 'utils/d3';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { IMetric } from './metricModel';
import { IMetricTrace, IRun, ITraceData } from './runModel';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

export interface IMetricAppModelState {
  refs: {
    tableRef: { current: ITableRef | null };
    chartPanelRef: { current: IChartPanelRef | null };
  };
  requestIsPending: boolean;
  queryIsEmpty: boolean;
  rawData: IRun<IMetricTrace>[];
  config: IMetricAppConfig;
  data: IMetricsCollection<IMetric>[];
  lineChartData: ILine[][];
  chartTitleData: IChartTitleData;
  aggregatedData: IAggregatedData[];
  tableData: IMetricTableRowData[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
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

interface IMetricAppConfig {
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      style: boolean;
    };
    seed: {
      color: number;
      style: number;
    };
    paletteIndex: number;
  };
  chart: {
    highlightMode: HighlightEnum;
    displayOutliers: boolean;
    zoom: IChartZoom;
    axesScaleType: IAxesScaleState;
    curveInterpolation: CurveEnum;
    smoothingAlgorithm: SmoothingAlgorithmEnum;
    smoothingFactor: number;
    focusedState: IFocusedState;
    aggregationConfig: IAggregationConfig;
    alignmentConfig: IAlignmentConfig;
    tooltip: IChartTooltip;
  };
  select: {
    metrics: ISelectMetricsOption[];
    query: string;
    advancedMode: boolean;
    advancedQuery: string;
  };
  table: {
    rowHeight: RowHeightSize;
    sortFields?: [string, boolean | 'asc' | 'desc'][];
    hiddenMetrics?: string[];
    hiddenColumns?: string[];
    columnsOrder?: {
      left: string[];
      middle: string[];
      right: string[];
    };
  };
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

export interface IChartTooltip {
  content: ITooltipContent;
  display: boolean;
  selectedParams: string[];
}

export interface IAlignmentConfig {
  metric: string;
  type: AlignmentOptions;
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
  xValue: number | string | null;
  yValue: number | null;
  chartIndex: number | null;
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
  time: string;
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
  groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  };
  groupKey: string;
  grouping: IMetricAppConfig['grouping'];
}

export type GroupNameType = 'color' | 'style' | 'chart';
export interface IGroupingSelectOption {
  label: string;
  group: string;
  value: string;
}

export interface IAppData extends Partial<IMetricAppConfig | IParamsAppConfig> {
  created_at?: string;
  id?: string;
  updated_at?: string;
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
