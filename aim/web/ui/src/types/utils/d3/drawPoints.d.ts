import React from 'react';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { IDrawAxesArgs } from './drawAxes';
import { IProcessedData } from './processData';

export interface IDrawPointsArgs {
  index: number;
  pointsRef: React.MutableRefObject<>;
  pointsNodeRef: React.MutableRefObject<>;
  data: IProcessedData[];
  xScale: IDrawAxesArgs['xScale'];
  yScale: IDrawAxesArgs['yScale'];
  highlightMode: HighlightEnum;
}
