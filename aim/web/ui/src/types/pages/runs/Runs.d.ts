import React from 'react';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { MetricsValueKeyEnum } from 'config/enums/tableEnums';

import { IColumnsOrder } from 'types/services/models/explorer/createAppModel';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

import { ITagProps } from '../tags/Tags';

export interface IRunsProps {
  tableData: IRun<IMetricTrace | IParamTrace>[];
}

export interface IRunsTableProps {
  columnsOrder: IColumnsOrder;
  tableRef: React.RefObject<any>;
  runsList: ITagProps[];
  isInfiniteLoading: boolean;
  hiddenColumns: string[];
  hideSystemMetrics: boolean;
  columns: any;
  metricsValueKey: MetricsValueKeyEnum;
  tableRowHeight: number;
  requestStatus: RequestStatusEnum;
  sameValueColumns: string[] | [];
  onExportTableData: () => void;
  onManageColumns: () => void;
  onColumnsVisibilityChange: (hiddenColumns: string[] | string) => void;
  onTableDiffShow: () => void;
  onMetricsValueKeyChange: (key: MetricsValueKeyEnum) => void;
  onRowHeightChange: () => void;
  getLastRunsData: (row: any) => any;
  isLatest?: boolean;
  data: any;
  columnsWidths: { [key: string]: number };
  columnsColorScales: { [key: string]: boolean };
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  selectedRows: { [key: string]: any };
  onRowSelect: (key: string) => any;
  archiveRuns: (ids: string[], archived: boolean) => void;
  deleteRuns: (ids: string[]) => void;
  onToggleColumnsColorScales: (colKey: string) => void;
}
