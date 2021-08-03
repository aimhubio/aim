import React from 'react';

interface IChartTypeConfig {
  [key: string]: React.LazyExoticComponent<any>;
}

export const chartTypesConfig: IChartTypeConfig = {
  LineChart: React.lazy(() => import('../LineChart/LineChart')),
  HighPlot: React.lazy(() => import('../HighPlot/HighPlot')),
};
