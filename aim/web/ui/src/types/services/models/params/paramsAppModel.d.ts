import {
  IGroupingSelectOption,
  IPanelTooltip,
  IFocusedState,
} from 'metrics/metricsAppModel';

import { ITableRef } from 'components/Table/Table';
import { IChartPanelRef } from 'components/ChartPanel/ChartPanel';
import { INotification } from 'components/NotificationContainer/NotificationContainer';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import { ITableColumn } from 'pages/metrics/components/TableColumns/TableColumns';

import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';

import { CurveEnum } from 'utils/d3';
import { IDimensionsType } from 'utils/d3/drawParallelAxes';

import {
  IChartTitleData,
  IMetricsCollection,
  ITooltipData,
  SortField,
} from '../metrics/metricsAppModel';

export interface IParamsAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestIsPending: boolean | null;
  queryIsEmpty: boolean;
  rawData: IRun<IParamTrace>[];
  config: IParamsAppConfig;
  data: IMetricsCollection<IParam>[];
  highPlotData: { dimensions: IDimensionsType; data: any }[];
  chartTitleData: IChartTitleData;
  tooltipData: ITooltipData;
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  metricsColumns: any;
}

export interface IParam {
  run: IRun<IParamTrace>;
  isHidden: boolean;
  color: string;
  key: string;
  dasharray: string;
}
export interface IParamsAppConfig {
  grouping?: {
    color: string[];
    stroke: string[];
    chart: string[];
    reverseMode: {
      color: boolean;
      stroke: boolean;
      chart: boolean;
    };
    isApplied: {
      color: boolean;
      stroke: boolean;
      chart: boolean;
    };
    persistence: {
      color: boolean;
      stroke: boolean;
    };
    seed: {
      color: number;
      stroke: number;
    };
    paletteIndex: number;
  };
  chart?: {
    curveInterpolation: CurveEnum;
    isVisibleColorIndicator: boolean;
    focusedState: IFocusedState;
    tooltip: IPanelTooltip;
  };
  select?: {
    params: any; // ISelectMetricsOption[];
    query: string;
  };
  table?: {
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
  };
  liveUpdate?: {
    delay: number;
    enabled: boolean;
  };
}
