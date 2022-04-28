import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';
import { IChartTitle } from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

export interface IHighPlotProps {
  index: number;
  nameKey?: string;
  brushExtents: { [key: string]: [number, number] };
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  syncHoverState: (args: ISyncHoverStateArgs) => void;
  onAxisBrashExtentChange: (key: string, extent: [number, number]) => void;
  data: any;
  chartTitle?: IChartTitle;
  readOnly?: boolean;
}
