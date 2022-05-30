import { ResizeModeEnum } from 'config/enums/tableEnums';

import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';
import { IChartTitle } from 'types/services/models/metrics/metricsAppModel';

import { CurveEnum } from 'utils/d3';

export interface IHighPlotProps {
  index: number;
  nameKey?: string;
  brushExtents: {
    [key: string]: {
      [key: string]: [number, number] | [string, string];
    };
  };
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  syncHoverState: (args: ISyncHoverStateArgs) => void;
  onAxisBrushExtentChange: (
    key: string,
    extent: [number, number] | [string, string] | null,
    chartIndex: number,
  ) => void;
  data: any;
  chartTitle?: IChartTitle;
  readOnly?: boolean;
  resizeMode?: ResizeModeEnum;
}
