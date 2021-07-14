export type ScaleType = 'log' | 'linear';

export interface ILine {
  key: string;
  data: {
    xValues: number[];
    yValues: number[];
  };
  color?: string;
  dasharray?: string;
  selector?: string;
}

export interface ILineChartProps {
  index: number;
  data: ILine[];
  xAlignment?: 'absolute_time' | 'relative_time' | 'epoch';
  displayOutliers: boolean;
  zoomMode: boolean;
  axisScaleType?: {
    x?: ScaleType;
    y?: ScaleType;
  };
  highlightMode: number;
}
