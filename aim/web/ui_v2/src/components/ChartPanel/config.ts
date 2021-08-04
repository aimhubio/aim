import React from 'react';

import { IChartTypeConfig } from 'types/components/ChartPanel/ChartPanel';

export const chartTypesConfig: IChartTypeConfig = {
  LineChart: React.lazy(() => import('../LineChart/LineChart')),
  HighPlot: React.lazy(() => import('../HighPlot/HighPlot')),
};
