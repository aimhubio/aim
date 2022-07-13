import { IPoint } from 'components/ScatterPlot';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import {
  IAppModelConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import { IDimensionType } from 'types/utils/d3/drawParallelAxes';
import { IParam } from 'types/services/models/params/paramsAppModel';
import {
  IChartTitleData,
  IGroupingSelectOption,
  IMetricsCollection,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';

import { IRequestProgress } from 'utils/app/setRequestProgress';
import { TrendlineTypeEnum } from 'utils/d3';

import { IMetricTrace, IRun } from './runModel';

export interface IScatterAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestStatus: RequestStatusEnum;
  requestProgress: IRequestProgress;
  queryIsEmpty: boolean;
  rawData: IRun<IMetricTrace>[];
  config: IAppModelConfig;
  data: IMetricsCollection<IParam>[];
  chartData: IScatterData[];
  tooltip: ITooltip;
  chartTitleData: IChartTitleData;
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  selectedRows: { [key: string]: any };
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  selectFormData: { options: ISelectOption[]; suggestions: string[] };
  liveUpdateConfig?: {
    delay: number;
    enabled: boolean;
  };
}

export interface IScatterData {
  dimensions: IDimensionType;
  data: IPoint[];
}

export interface ITrendlineOptions {
  type: TrendlineTypeEnum;
  bandwidth: number;
  isApplied: boolean;
}
