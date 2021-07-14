import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { IMetric } from 'types/services/models/metrics/metricModel';
import { CurveEnum } from 'utils/d3';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  metricsCollection: [IMetric[]];
  tableElemRef: React.MutableRefObject<>;
  chartElemRef: React.MutableRefObject<>;
  wrapperElemRef: React.MutableRefObject<>;
  resizeElemRef: React.MutableRefObject<>;
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
