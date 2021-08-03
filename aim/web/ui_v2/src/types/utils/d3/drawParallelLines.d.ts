import { CurveEnum } from 'utils/d3';
import { DimensionsType } from './drawParallelAxes';

type LineDataType = {
  [key: string]: number | string | null;
};

export type LinesDataType = {
  values: LineDataType;
  key: string | number;
  color: string;
};

export type InitialPathDataType = {
  dimensionList: string[];
  lineData: LineDataType;
  isEmpty: boolean;
  isDotted: boolean;
};

export interface IDrawParallelLinesProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  curveInterpolation: CurveEnum;
  linesRef: React.MutableRefObject<>;
  dimensions: DimensionsType;
  data: LinesDataType[];
}

export interface IDrawParallelLineProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  dimensionList: string[];
  lineData: LineDataType;
  curveInterpolation: CurveEnum;
  isDotted: boolean;
  key: number | string;
  color: string;
}

export interface ILineRendererProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  curveInterpolation: CurveEnum;
  keysOfDimensions: string[];
  data: LinesDataType[];
}
