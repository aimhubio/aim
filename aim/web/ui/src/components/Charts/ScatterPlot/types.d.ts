type Data = Array<Array<number>>;

export type DataSet = {
  circleRadius?: number;
  circleColor?: string;
  label: string;
  data: Data;
};

export type SizeState = {
  width?: number;
  height?: number;
};

export interface IScatterPlotProps {
  yAxisLabel?: string;
  xAxisLabel?: string;
  dataSets: DataSet[];
  width?: number;
  height?: number;
}

export interface IAxisProps {
  transform: string;
  label?: string;
  scale: any;
}

export interface ICircleProps {
  data: Data;
  scale: {
    x_scale: any;
    y_scale: any;
  };
  color?: string;
  radius?: number;
}
