import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { CurveEnum } from 'utils/d3';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';

export interface IParamsProps extends Partial<RouteChildrenProps> {
  chartElemRef: React.RefObject<HTMLDivElement>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  curveInterpolation: CurveEnum;
  onCurveInterpolationChange: () => void;
  onActivePointChange: (
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ) => void;
  focusedState: IFocusedState;
  onColorIndicatorChange: () => void;
  isVisibleColorIndicator: boolean;
}
