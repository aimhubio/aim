import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import {
  IChartTitleData,
  IGroupingSelectOption,
  IMetricsCollection,
} from '../metrics/metricsAppModel';
import { IParam } from '../params/paramsAppModel';

import { IMetricTrace, IRun } from './runModel';

export interface IScatterAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestIsPending: boolean | null;
  queryIsEmpty: boolean;
  rawData: IRun<IMetricTrace>[];
  config: IScatterAppConfig;
  data: IMetricsCollection<IParam>[];
  chartData: ILine[][];
  chartTitleData: IChartTitleData;
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

// export interface IScatterAppConfig {
//   grouping?: {
//     color: string[];
//     chart: string[];
//     reverseMode: {
//       color: boolean;
//       stroke: boolean;
//       chart: boolean;
//     };
//     isApplied: {
//       color: boolean;
//       stroke: boolean;
//       chart: boolean;
//     };
//     persistence: {
//       color: boolean;
//       stroke: boolean;
//     };
//     seed: {
//       color: number;
//       stroke: number;
//     };
//     paletteIndex: number;
//   };
//   chart?: {
//     highlightMode: HighlightEnum;
//     ignoreOutliers: boolean;
//     zoom: IChartZoom;
//     axesScaleType: IAxesScaleState;
//     curveInterpolation: CurveEnum;
//     smoothingAlgorithm: SmoothingAlgorithmEnum;
//     smoothingFactor: number;
//     focusedState: IFocusedState;
//     aggregationConfig: IAggregationConfig;
//     densityType: DensityOptions;
//     alignmentConfig: IAlignmentConfig;
//     tooltip: IChartTooltip;
//   };
//   select?: {
//     metrics: ISelectOption[];
//     query: string;
//     advancedMode: boolean;
//     advancedQuery: string;
//   };
//   table?: {
//     resizeMode: ResizeModeEnum;
//     rowHeight: RowHeightSize;
//     sortFields?: SortField[];
//     hiddenMetrics?: string[];
//     hiddenColumns?: string[];
//     columnsWidths?: { [key: string]: number };
//     columnsOrder?: {
//       left: string[];
//       middle: string[];
//       right: string[];
//     };
//     height: string;
//   };
//   liveUpdate?: {
//     delay: number;
//     enabled: boolean;
//   };
// }
