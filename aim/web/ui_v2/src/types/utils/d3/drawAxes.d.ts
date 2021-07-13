import React from 'react';
import * as d3 from 'd3';

export interface IDrawAxesProps {
  plotBoxRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  xScale: d3.ScaleLogarithmic | d3.ScaleLinear;
  yScale: d3.ScaleLogarithmic | d3.ScaleLinear;
}
