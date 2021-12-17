import React from 'react';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';

import { IAxisScale } from './getAxisScale';

export interface IDrawAxesArgs {
  svgNodeRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  xScale: IAxisScale;
  yScale: IAxisScale;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  alignmentConfig?: IAlignmentConfig;
  humanizerConfigRef: React.MutableRefObject<{}>;
  drawBgTickLines?: { x?: boolean; y?: boolean };
}
