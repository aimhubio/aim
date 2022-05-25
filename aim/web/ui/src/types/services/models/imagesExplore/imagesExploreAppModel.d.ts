import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { ITableRef } from 'types/components/Table/Table';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IPanelTooltip } from 'types/services/models/metrics/metricsAppModel';
import {
  IColumnsOrder,
  ISelectConfig,
} from 'types/services/models/explorer/createAppModel';

import { SortFields } from 'utils/getSortedFields';

export interface IImagesExploreAppConfig {
  grouping: {
    row: string[];
    reverseMode: {
      row: boolean;
    };
    isApplied: {
      row: boolean;
    };
  };
  images: {
    recordSlice?: number[] | number;
    indexSlice?: number[] | number;
    stepRange?: number[];
    indexRange?: number[];
    recordDensity?: string;
    indexDensity?: string;
    tooltip: IPanelTooltip;
    focusedState: {
      key: string | null;
      active: boolean;
    };
    additionalProperties: {
      alignmentType: string;
      mediaItemSize: number;
      imageRendering: string;
      stacking: boolean;
    };
    sortFields?: SortFields;
    sortFieldsDict: any;
    inputsValidations: any;
  };
  select: ISelectConfig;
  table: {
    resizeMode: ResizeModeEnum;
    rowHeight: RowHeightSize;
    sortFields?: SortFields;
    hiddenMetrics?: string[];
    hiddenColumns?: string[];
    hideSystemMetrics?: undefined;
    columnsWidths?: { [key: string]: number };
    columnsOrder?: IColumnsOrder;
    height: string;
  };
}

export interface IImagesExploreAppModelState {
  refs: {
    tableRef: { current: ITableRef | null };
  };
  requestStatus: RequestStatusEnum;
  queryIsEmpty: boolean;
  rawData: any[];
  config: IImagesExploreAppConfig;
  data: any;
  imagesData: any;
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  groupingSelectOptions: IGroupingSelectOption[];
  searchButtonDisabled: boolean;
  applyButtonDisabled: boolean;
  selectFormData: {
    options: ISelectOption[] | undefined;
    suggestions: string[];
  };
  selectedRows: { [key: string]: any };
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
  seqKey: string;
  name: string;
  run: IImageRunData;
  step: number;
  width: number;
}

export interface IProcessedImageData extends IImageData {
  seqKey?: string;
  name?: string;
  step?: number;
  context?: object;
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
    record_range: number[];
  };
  traces: any[];
}
