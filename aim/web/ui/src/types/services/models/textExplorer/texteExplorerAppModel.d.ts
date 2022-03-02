import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

import { ITableColumn } from 'pages/metrics/components/TableColumns/TableColumns';

import { IColumnsOrder, ISelectConfig } from 'types/explorer/createAppModel';
import { ITableRef } from 'types/components/Table/Table';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ISelectOption } from 'types/services/explorer/createAppModel';

import { SortFields } from 'utils/getSortedFields';

export interface ITextExplorerAppConfig {
  texts: {
    recordSlice?: number[] | number;
    indexSlice?: number[] | number;
    stepRange?: number[];
    indexRange?: number[];
    recordDensity?: string;
    indexDensity?: string;
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

export interface ITextExplorerAppModelState {
  refs: {
    tableRef: { current: ITableRef | null };
    textTableRef: { current: ITableRef | null };
  };
  requestStatus: RequestStatusEnum;
  queryIsEmpty: boolean;
  rawData: any[];
  config: ITextExplorerAppConfig;
  data: any;
  textsData: any;
  tableData: any[];
  tableColumns: ITableColumn[];
  sameValueColumns: string[];
  params: string[];
  notifyData: INotification[];
  searchButtonDisabled: boolean;
  groupingSelectOptions: IGroupingSelectOption[];
  applyButtonDisabled: boolean;
  selectFormData: {
    options: ISelectOption[] | any;
    suggestions: string[];
  };
  selectedRows: { [key: string]: any };

  // liveUpdateConfig: {
  //   delay: number;
  //   enabled: boolean;
  // };
}
