import { LegendsDataType } from 'types/services/models/metrics/metricsAppModel';

import { LegendsModeEnum } from 'utils/d3';

export interface IChartLegendsProps {
  data?: LegendsDataType;
  mode?: LegendsModeEnum;
  readOnly?: boolean;
}
