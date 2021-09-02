import React from 'react';

import { IChartTypeConfig } from 'types/components/ChartPanel/ChartPanel';
import LineChart from '../LineChart/LineChart';
import HighPlot from '../HighPlot/HighPlot';

// export const chartTypesConfig: IChartTypeConfig = {
//   LineChart: React.lazy(() => import('../LineChart/LineChart')),
//   HighPlot: React.lazy(() => import('../HighPlot/HighPlot')),
// };

export const chartTypesConfig: IChartTypeConfig = {
  LineChart,
  HighPlot,
};
