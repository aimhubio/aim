import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import { ITableRef } from 'types/components/Table/Table';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTableRowData } from 'types/services/models/metrics/metricsCollectionModel';
import { ITableColumn } from './components/TableColumns/TableColumns';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  metricsCollection: IMetric[][];
  lineChartData: ILine[][];
  tableData: IMetricTableRowData[][];
  tableColumns: ITableColumn[];
  tableRef: React.RefObject<ITableRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  chartElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  displayOutliers: boolean;
  zoomMode: boolean;
  toggleDisplayOutliers: () => void;
  toggleZoomMode: () => void;
  handleSmoothing: (props: IHandleSmoothing) => void;
  curveInterpolation: CurveEnum;
}

export interface IHandleSmoothing {
  algorithm: string;
  factor: number;
  curveInterpolation: CurveEnum;
}
