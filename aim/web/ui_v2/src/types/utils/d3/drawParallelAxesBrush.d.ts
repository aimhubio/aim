import React from 'react';
import { IGetAxisScale } from './getAxisScale';
import { ILinesDataType } from './drawParallelLines';
import { DimensionsType } from './drawParallelAxes';

export interface IDrawParallelAxesBrushBrushProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  data: ILinesDataType[];
  dimensions: DimensionsType;
}

export interface IHandleBrushChange {
  xValues: IGetAxisScale;
  yValues: IGetAxisScale;
  mousePosition: number[];
}

export type DomainsDataType = {
  [key: string]: number[] | string[];
};

export interface IFilterDataByBrushedScaleProps {
  line: ILinesDataType;
  domainsData: DomainsDataType;
  dimensions: DimensionsType;
}
