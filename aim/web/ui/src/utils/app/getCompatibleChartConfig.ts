import { IChart } from 'types/services/models/explorer/createAppModel';

import { AlignmentOptionsEnum } from '../d3';

const CompatibleAlignmentOptions = [...Object.values(AlignmentOptionsEnum)];

export function getCompatibleChartConfig(chart: IChart): IChart {
  if (chart) {
    if (typeof chart.alignmentConfig?.type === 'number') {
      // @ts-ignore
      chart.alignmentConfig.type =
        CompatibleAlignmentOptions[chart.alignmentConfig.type];
    }
  }
  return chart;
}
