import React from 'react';
import { IGetAxisScale } from './getAxisScale';
import { ILineDataType } from './drawParallelLines';
import { IDimensionsType } from './drawParallelAxes';

export interface IDrawParallelAxesBrushBrushProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  data: ILineDataType[];
  dimensions: IDimensionsType;
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
  line: ILineDataType;
  domainsData: DomainsDataType;
  dimensions: IDimensionsType;
}
