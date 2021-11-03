import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';

import { SortField } from '../metrics/metricsAppModel';

export interface IRunsAppModelState {
  [key: string]: any;
}

export interface IRunsAppConfig {
  select?: {
    metrics: ISelectMetricsOption[];
    query: string;
    advancedMode: boolean;
    advancedQuery: string;
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
  pagination?: {
    limit: number;
    offset: null;
    isLatest: boolean;
  };
  liveUpdate?: {
    delay: number;
    enabled: boolean;
  };
}
