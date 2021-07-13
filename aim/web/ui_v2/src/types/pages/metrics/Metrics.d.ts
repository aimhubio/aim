import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { IMetric } from 'types/services/models/metrics/metricModel';

export interface IMetricProps extends Partial<RouteChildrenProps> {
  metricsCollection: [IMetric[]];
  tableElemRef: React.MutableRefObject<>;
  chartElemRef: React.MutableRefObject<>;
  wrapperElemRef: React.MutableRefObject<>;
  resizeElemRef: React.MutableRefObject<>;
  displayOutliers: boolean;
  toggleDisplayOutliers: () => void;
}
