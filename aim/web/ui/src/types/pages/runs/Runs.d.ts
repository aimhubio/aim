import React from 'react';

import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

export interface IRunsProps {
  tableData: IRun<IMetricTrace | IParamTrace>[];
}

export interface IRunsTableProps {
  columnsOrder: any;
  tableRef: React.RefObject<any>;
  runsList: ITagProps[];
  isRunsDataLoading: boolean;
  isInfiniteLoading: boolean;
  hiddenColumns: string[];
  columns: any;
  tableRowHeight: number;
  onExportTableData: () => void;
  onManageColumns: () => void;
  onColumnsVisibilityChange: (hiddenColumns: string[]) => void;
  onTableDiffShow: () => void;
  onRowHeightChange: () => void;
  getLastRunsData: (row: any) => void;
  isLatest?: boolean;
  data: any;
  columnsWidths: { [key: string]: number };
  updateColumnsWidths: (key: string, width: number, isReset: boolean) => void;
  selectedRows: { [key: string]: any };
  onRowSelect: (key: string) => any;
  archiveRuns: (ids: string[], archived: boolean) => void;
  deleteRuns: (ids: string[]) => void;
}
