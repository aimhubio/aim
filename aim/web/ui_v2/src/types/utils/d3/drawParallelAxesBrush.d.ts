import React from 'react';
import { IGetAxesScale } from './getAxesScale';
import { LinesDataType } from './drawParallelLines';
import { DimensionsType } from './drawParallelAxes';

export interface IDrawParallelAxesBrushBrushProps {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  data: LinesDataType[];
  dimensions: DimensionsType;
}

export interface IHandleBrushChange {
  xValues: IGetAxesScale['xScale'];
  yValues: IGetAxesScale['yScale'];
  mousePosition: number[];
}

export type DomainsDataType = {
  [key: string]: number[] | string[];
};

export interface IFilterDataByBrushedScaleProps {
  line: LinesDataType;
  domainsData: DomainsDataType;
  dimensions: DimensionsType;
}
