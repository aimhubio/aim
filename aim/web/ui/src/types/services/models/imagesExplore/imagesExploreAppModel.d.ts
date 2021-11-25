import { ITableRef } from 'types/components/Table/Table';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';

import { IPanelTooltip } from '../metrics/metricsAppModel';

export interface IImagesExploreAppConfig {
  grouping: {
    group: [];
    reverseMode: {
      group: boolean;
    };
    isApplied: {
      group: boolean;
    };
  };
  images: {
    recordSlice?: number[] | number;
    indexSlice?: number[] | number;
    stepRange?: number[];
    indexRange?: number[];
    recordDensity?: string;
    indexDensity?: string;
    calcRanges: boolean;
    tooltip: IPanelTooltip;
    focusedState: {
      key: string | null;
      active: boolean;
    };
  };
  select: {
    images: ISelectMetricsOption[];
    query: string;
    advancedMode: boolean;
    advancedQuery: string;
  };
  table: {
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
}

export interface IImagesExploreAppModelState {
  refs: {
    tableRef: { current: ITableRef | null };
  };
  requestIsPending: boolean | null;
  queryIsEmpty: boolean;
  rawData: any[];
  config: IImagesExploreAppConfig;
  data: any;
  imagesData: any;
  tableData: any[];
  tableColumns: ITableColumn[];
  imagesBlobs: { [key: string]: string };
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  searchButtonDisabled: boolean;
  applyButtonDisabled: boolean;
  // liveUpdateConfig: {
  //   delay: number;
  //   enabled: boolean;
  // };
}

export interface IGroupingSelectOption {
  label: string;
  group: string;
  value: string;
}

export interface IImageData {
  blob_uri: string;
  caption: string;
  context: object;
  format: string;
  height: number;
  index: number;
  key: string;
  run: IImageRunData;
  step: number;
  width: number;
}
export interface IImageRunData {
  hash: string;
  params: { [key: string]: unknown };
  props: {
    archived: 0 | 1;
    creation_time: number;
    end_time: number;
    experiment: string;
    name: string;
    tags: any[];
  };
  ranges: {
    index_range: number[];
    index_slice: number[];
    record_range: number[];
    record_slice: number[];
  };
  traces: any[];
}
