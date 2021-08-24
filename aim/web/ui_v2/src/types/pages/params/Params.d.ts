import React from 'react';
import { RouteChildrenProps } from 'react-router-dom';

import { CurveEnum } from 'utils/d3';
import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IParamsAppConfig } from 'types/services/models/params/paramsAppModel';

export interface IParamsProps extends Partial<RouteChildrenProps> {
  chartElemRef: React.RefObject<HTMLDivElement>;
  chartPanelRef: React.RefObject<IChartPanelRef>;
  tableRef: React.RefObject<ITableRef>;
  tableElemRef: React.RefObject<HTMLDivElement>;
  wrapperElemRef: React.RefObject<HTMLDivElement>;
  resizeElemRef: React.RefObject<HTMLDivElement>;
  curveInterpolation: CurveEnum;
  highPlotData: any;
  onCurveInterpolationChange: () => void;
  onActivePointChange: (
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ) => void;
  focusedState: IFocusedState;
  onColorIndicatorChange: () => void;
  isVisibleColorIndicator: boolean;
  tooltipContent: ITooltipContent;
  onParamsSelectChange: IParamsAppConfig['onParamsSelectChange'];
  selectedParamsData: IParamsAppConfig['select']['params'];
}
