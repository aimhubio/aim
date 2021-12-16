import React from 'react';

import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { CurveEnum } from 'utils/d3';

import { IDimensionsType } from './drawParallelAxes';

interface ILineValuesDataType {
  [key: string]: number | string | null;
}

export interface ILineDataType {
  values: ILineValuesDataType;
  key: string;
  color: string;
  dasharray: string;
}

export type InitialPathDataType = {
  dimensionList: string[];
  lineData: ILineValuesDataType;
  isEmpty: boolean;
  isDotted: boolean;
};

export interface IDrawParallelLinesArgs {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  curveInterpolation: CurveEnum;
  isVisibleColorIndicator: boolean;
  linesRef: React.MutableRefObject<>;
  dimensions: IDimensionsType;
  data: ILineDataType[];
}

export interface IDrawParallelLineArgs {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  dasharray: string;
  dimensionList: string[];
  curveInterpolation: CurveEnum;
  lineData: ILineValuesDataType;
  isDotted: boolean;
  key: number | string;
  color: string;
}

export interface ILineRendererArgs {
  linesNodeRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  curveInterpolation: CurveEnum;
  keysOfDimensions: string[];
  isVisibleColorIndicator: boolean;
  data: ILineDataType[];
}

export interface IGetColorIndicatorScaleValueArgs {
  line: ILineValuesDataType;
  keysOfDimensions: string[];
  yColorIndicatorScale: d3.ScaleSequential;
  yScale: IAxisScale;
}
