import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { IChart } from 'types/services/models/explorer/createAppModel';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { AlignmentOptionsEnum } from 'utils/d3';

const CompatibleAlignmentOptions = [...Object.values(AlignmentOptionsEnum)];

export function getCompatibleChartConfig(chart: any): IChart {
  if (chart) {
    if (typeof chart.alignmentConfig?.type === 'number') {
      makeAlignmentConfigCompatible(chart);
    }
    if (
      chart.hasOwnProperty('smoothingAlgorithm') &&
      chart.hasOwnProperty('smoothingFactor') &&
      chart.hasOwnProperty('curveInterpolation')
    ) {
      makeSmoothingConfigCompatible(chart);
    }
  }
  return chart;
}

function makeAlignmentConfigCompatible(chart: any) {
  chart.alignmentConfig.type =
    CompatibleAlignmentOptions[chart.alignmentConfig.type];
}

function makeSmoothingConfigCompatible(chart: any): void {
  if (!chart.smoothing) {
    chart.smoothing = CONTROLS_DEFAULT_CONFIG.metrics.smoothing;
  }
  if (
    (chart.smoothingAlgorithm === SmoothingAlgorithmEnum.EMA &&
      chart.smoothingFactor !== 0) ||
    (chart.smoothingAlgorithm === SmoothingAlgorithmEnum.CMA &&
      chart.smoothingFactor !== 1)
  ) {
    chart.smoothing.isApplied = true;
  }

  chart.smoothing.factor = chart.smoothingFactor;
  chart.smoothing.algorithm = chart.smoothingAlgorithm;
  chart.smoothing.curveInterpolation = chart.curveInterpolation;
  delete chart.smoothingFactor;
  delete chart.smoothingAlgorithm;
  delete chart.curveInterpolation;
}
