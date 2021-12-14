import * as d3 from 'd3';
import React from 'react';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

import { ScaleEnum } from 'utils/d3';

export interface IGetAxesScaleProps {
  visBoxRef: React.MutableRefObject<>;
  axesScaleType: IAxesScaleState;
  min: { x: number; y: number };
  max: { x: number; y: number };
}

export type IAxisScale = d3.ScaleLogarithmic | d3.ScaleLinear | d3.ScalePoint;

export interface IGetAxisScaleProps {
  scaleType: ScaleEnum;
  domainData: string[] | number[];
  rangeData: number[];
}
