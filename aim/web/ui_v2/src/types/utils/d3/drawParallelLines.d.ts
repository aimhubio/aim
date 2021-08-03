import React from 'react';
import { DimensionsType } from './drawParallelAxes';

interface ILineDataType {
  [key: string]: number | string | null;
}

export interface ILinesDataType {
  values: ILineDataType;
  key: string;
  color: string;
}

export type InitialPathDataType = {
  dimensionList: string[];
  lineData: ILineDataType;
  isEmpty: boolean;
  isDotted: boolean;
};

export interface IDrawParallelLinesProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  dimensions: DimensionsType;
  data: ILinesDataType[];
}

export interface IDrawParallelLineProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  dimensionList: string[];
  lineData: ILineDataType;
  isDotted: boolean;
  key: number | string;
  color: string;
}

export interface ILineRendererProps {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  keysOfDimensions: string[];
  data: ILinesDataType[];
}
