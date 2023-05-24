import React from 'react';

import { ILineDataType } from './drawParallelLines';
import { IDimensionsType } from './drawParallelAxes';

export interface IDrawParallelAxesBrushBrushArgs {
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  brushRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  linesRef: React.MutableRefObject<>;
  onAxisBrushExtentChange: (
    key: string,
    extent: [number, number] | [string, string] | null,
    chartIndex: number,
  ) => void;
  brushExtents: {
    [key: string]: {
      [key: string]: [number, number] | [string, string];
    };
  };
  data: ILineDataType[];
  dimensions: IDimensionsType;
  index: number;
}

export type DomainsDataType = {
  [key: string]: number[] | string[];
};

export interface IFilterDataByBrushedScaleProps {
  line: ILineDataType;
  domainsData: DomainsDataType;
  dimensions: IDimensionsType;
  attributesRef: React.MutableRefObject<>;
}
