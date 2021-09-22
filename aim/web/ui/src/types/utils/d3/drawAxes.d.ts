import React from 'react';
import * as d3 from 'd3';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { IAttributesRef } from 'types/components/LineChart/LineChart';

export interface IDrawAxesProps {
  svgNodeRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  xScale: d3.ScaleLogarithmic | d3.ScaleLinear;
  yScale: d3.ScaleLogarithmic | d3.ScaleLinear;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  alignmentConfig?: IAlignmentConfig;
  xValues: number[];
  attributesRef: React.MutableRefObject<IAttributesRef>;
  humanizerConfigRef: React.MutableRefObject<{}>;
}
