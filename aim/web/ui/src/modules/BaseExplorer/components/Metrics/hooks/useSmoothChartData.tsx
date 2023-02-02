import React from 'react';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { ISmoothingConfig } from 'pages/MetricsExplorer/Controls/Smoothing';

import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from 'utils/smoothingData';

const SMOOTHING_FUNCTION_DICT = {
  [SmoothingAlgorithmEnum.EMA]: calculateExponentialMovingAverage,
  [SmoothingAlgorithmEnum.CMA]: calculateCentralMovingAverage,
};

function useSmoothChartData(
  engine: IBoxContentProps['engine'],
  visualizationName: string,
  data: any[],
): [typeof data, ISmoothingConfig] {
  const vizEngine = engine.visualizations[visualizationName];
  const config: ISmoothingConfig = engine.useStore(
    vizEngine.controls.smoothing.stateSelector,
  );

  const smoothedData = React.useMemo(() => {
    const smoothingFn = SMOOTHING_FUNCTION_DICT[config.algorithm];
    if (typeof smoothingFn !== 'function') return data;

    const items = [];
    for (let item of data) {
      const smoothedValues = smoothingFn(item.data.yValues, config.factor);
      items.push({ ...item, data: { ...item.data, yValues: smoothedValues } });
    }
    return items;
  }, [data, config]);

  return [smoothedData, config];
}

export default useSmoothChartData;
