import { IPoint } from 'components/ScatterPlot';

import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { ITableRef } from 'types/components/Table/Table';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';
import { IDimensionType } from 'types/utils/d3/drawParallelAxes';
import { IParam } from 'types/services/models/params/paramsAppModel';
import {
  IChartTitleData,
  IGroupingSelectOption,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';

import { IMetricTrace, IRun } from './runModel';

export interface IScatterAppModelState {
  refs: {
    tableRef?: { current: ITableRef | null };
    chartPanelRef?: { current: IChartPanelRef | null };
  };
  requestIsPending: boolean | null;
  queryIsEmpty: boolean;
  rawData: IRun<IMetricTrace>[];
  config: IAppModelConfig;
  data: IMetricsCollection<IParam>[];
  chartData: IScatterData[];
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

export interface IScatterData {
  dimensions: IDimensionType;
  data: IPoint[];
}
