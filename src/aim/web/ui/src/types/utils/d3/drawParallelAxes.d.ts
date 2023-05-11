import React from 'react';

import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { ScaleEnum } from 'utils/d3';

export interface IDimensionType {
  scaleType: ScaleEnum;
  domainData: number[] | string[];
  displayName: string;
  dimensionType: string;
}

export interface YScaleType {
  [key: string]: IAxisScale;
}

export interface IDimensionsType {
  [key: string]: IDimensionType;
}

export interface IDrawParallelAxesProps {
  axesNodeRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  dimensions: IDimensionsType;
  plotBoxRef: React.MutableRefObject<>;
}
