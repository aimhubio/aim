import React from 'react';

import { IChartZoom } from 'types/services/models/metrics/metricsAppModel';
import { IAttributesRef } from 'types/components/LineChart/LineChart';
import { IAxesScaleRange } from 'types/components/AxesPropsPopover/AxesPropsPopover';

import { IGetAxesScaleProps } from './getAxisScale';

export interface IDrawBrushArgs extends IGetAxesScaleProps {
  id: string;
  plotBoxRef: React.MutableRefObject<>;
  plotNodeRef: React.MutableRefObject<>;
  visBoxRef: React.MutableRefObject<>;
  axesRef: React.MutableRefObject<>;
  attributesRef: React.MutableRefObject<IAttributesRef>;
  linesRef: React.MutableRefObject<>;
  svgNodeRef: React.MutableRefObject<>;
  zoom?: IChartZoom;
  onZoomChange?: (zoom: Partial<IChartZoom>) => void;
  readOnly: boolean;
  axesScaleRange?: IAxesScaleRange;
  unableToDrawConditions: Array<{ condition: boolean; text?: string }>;
}
