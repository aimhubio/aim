import React from 'react';
import { IMetricTableRowData } from 'types/services/models/metrics/metricsAppModel';

export interface ITableColumn {
  dataKey: string;
  key: string;
  title: string;
  frozen?: string;
  resizable?: boolean;
  dataGetter?: (params: { rowData: IMetricTableRowData }) => string;
  cellRenderer?: (params: { cellData: string | string[] }) => React.ReactNode;
  width?: number;
}
