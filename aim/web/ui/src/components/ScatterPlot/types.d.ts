import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IChartTitle } from 'types/services/models/metrics/metricsAppModel';
import { ITrendlineOptions } from 'types/services/models/scatter/scatterAppModel';
import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';
import { IDimensionType } from 'types/utils/d3/drawParallelAxes';
import { IRun } from 'types/services/models/metrics/runModel';

export interface IPoint {
  key: string;
  data: {
    xValues: number[] | string[];
    yValues: number[] | string[];
  };
  color: string;
  groupKey: string;
  chartIndex?: number;
  run?: IRun;
}

export interface IScatterPlotProps {
  index: number;
  nameKey?: string;
  data: { dimensions: IDimensionType[]; data: IPoint[] };
  chartTitle?: IChartTitle;
  trendlineOptions: ITrendlineOptions;
  syncHoverState: (args: ISyncHoverStateArgs) => void;
  readOnly?: boolean;
  resizeMode?: ResizeModeEnum;
}
