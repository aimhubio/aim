import * as d3 from 'd3';
import React from 'react';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

export interface IGetAxesScaleProps {
  visBoxRef: React.MutableRefObject<>;
  axesScaleType: IAxesScaleState;
  min: { x: number; y: number };
  max: { x: number; y: number };
}

export type IScale = d3.ScaleLogarithmic | d3.ScaleLinear;

export interface IGetAxesScale {
  xScale: IScale;
  yScale: IScale;
}
