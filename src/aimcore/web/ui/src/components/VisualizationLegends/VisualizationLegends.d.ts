import { LegendsModeEnum } from 'utils/d3';

export interface IVisualizationLegendsProps {
  data?: VisualizationLegendsDataType;
  mode?: LegendsModeEnum;
  readOnly?: boolean;
}

export interface LegendColumnDataType {
  value: string;
  order?: number;
  color?: string;
  dasharray?: string;
  chartIndex?: number;
}

export interface LegendsDataType {
  [key: string]: Record<string, LegendColumnDataType[]>;
}
