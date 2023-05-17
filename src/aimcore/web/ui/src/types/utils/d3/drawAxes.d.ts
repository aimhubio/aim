import React from 'react';

import { IAlignmentConfig } from 'types/services/models/metrics/metricsAppModel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

import { IAxisScale } from './getAxisScale';

export interface IDrawAxesArgs {
  svgNodeRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  xScale: IAxisScale;
  yScale: IAxisScale;
  visBoxRef: React.MutableRefObject<>;
  alignmentConfig?: IAlignmentConfig;
  axesScaleType: IAxesScaleState;
  humanizerConfigRef: React.MutableRefObject<{}>;
  drawBgTickLines?: { x?: boolean; y?: boolean };
}
