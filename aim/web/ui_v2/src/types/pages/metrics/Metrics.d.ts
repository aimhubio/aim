import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTableRowData } from 'types/services/models/metrics/metricsCollectionModel';
import { ITableColumn } from './components/TableColumns/TableColumns';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  metricsCollection: IMetric[][];
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  tableRef: React.RefObject<any>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  displayOutliers: boolean;
  toggleDisplayOutliers: () => void;
  handleResize: () => void;
}
