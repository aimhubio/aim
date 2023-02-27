import { LegendsModeEnum } from 'utils/d3';

export interface VisualizationLegendsColumnDataType {
  color?: string;
  dasharray?: string;
  visId?: string;
  value: string;
}

export interface VisualizationLegendsDataType {
  [key: string]: Record<string, VisualizationLegendsColumnDataType[]>;
}

export interface IVisualizationLegendsProps {
  data?: VisualizationLegendsDataType;
  mode?: LegendsModeEnum;
  readOnly?: boolean;
}
