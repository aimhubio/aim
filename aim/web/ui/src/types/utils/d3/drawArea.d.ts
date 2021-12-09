import React from 'react';

import { IChartTitle } from 'types/services/models/metrics/metricsAppModel';

export interface IDrawAreaArgs {
  index?: number;
  parentRef: React.MutableRefObject<>;
  visAreaRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  bgRectNodeRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  axesNodeRef: React.MutableRefObject<>;
  plotBoxRef: React.MutableRefObject<>;
  linesNodeRef: React.MutableRefObject<>;
  attributesNodeRef: React.MutableRefObject<>;
  chartTitle?: IChartTitle;
}
