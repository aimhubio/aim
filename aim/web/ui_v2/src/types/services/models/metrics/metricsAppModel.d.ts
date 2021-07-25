import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableRef } from 'types/components/Table/Table';
import { CurveEnum } from 'utils/d3';
import { IMetric } from './metricModel';
import { IRun } from './runModel';

export interface IMetricAppModelState {
  rawData: IRun[];
  config: IMetricAppConfig;
  data: IMetric[][];
  lineChartData: ILine[][];
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
  };
  chart: {
    highlightMode: HighlightEnum;
    displayOutliers: boolean;
    zoomMode: boolean;
    axesScaleType: IAxesScaleState;
    curveInterpolation: CurveEnum;
    smoothingAlgorithm: SmoothingAlgorithmEnum;
    smoothingFactor: number;
    aggregated: boolean;
    focusedState: {
      key: string | null;
      xValue: number | null;
      yValue: numbae | null;
      active: boolean;
      chartIndex: number | null;
    };
  };
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
