import React from 'react';

import { ILineDataType } from './drawParallelLines';
import { IDimensionsType } from './drawParallelAxes';

export interface IDrawParallelAxesBrushBrushArgs {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  data: ILineDataType[];
  dimensions: IDimensionsType;
}

export type DomainsDataType = {
  [key: string]: number[] | string[];
};

export interface IFilterDataByBrushedScaleProps {
  line: ILineDataType;
  domainsData: DomainsDataType;
  dimensions: IDimensionsType;
}
