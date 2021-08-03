import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { CurveEnum } from 'utils/d3';
import { IMetric } from './metricModel';
import { IRun } from './runModel';
import { SmoothingAlgorithmEnum } from '../../../../utils/smoothingData';

export interface IMetricAppModelState {
  rawData: IRun[];
  config: IMetricAppConfig;
  data: IMetricsCollection[];
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  params: string[];
}

export interface IMetricsCollection {
  config: unknown;
  color: string | null;
  dasharray: string | null;
  chartIndex: number;
  data: IMetric[];
}

interface IMetricAppConfig {
  refs: {
    tableRef: { current: ITableRef | null };
    chartPanelRef: { current: IChartPanelRef | null };
  };
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      style: boolean;
      chart: boolean;
    };
    paletteIndex: number;
    selectOptions: string[];
  };
  chart: {
    highlightMode: HighlightEnum;
    displayOutliers: boolean;
    zoomMode: boolean;
    axesScaleType: IAxesScaleState;
    curveInterpolation: CurveEnum;
    smoothingAlgorithm: SmoothingAlgorithmEnum;
    smoothingFactor: number;
    focusedState: IFocusedState;
    aggregated: boolean;
  };
}

export interface IFocusedState {
  key: string | null;
  xValue: number | null;
  yValue: number | null;
  active: boolean;
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
  iteration: string;
}

export interface IGetDataAsLinesProps {
  smoothingFactor?: number;
  smoothingAlgorithm?: string;
  collection?: IMetric[][];
}

export interface IOnGroupingSelectChangeParams {
  field: groupNames;
  list: string[];
}

export interface IOnGroupingModeChangeParams {
  field: groupNames;
  value: boolean;
  options?: any[] | null;
}

export type groupNames = 'color' | 'style' | 'chart';
