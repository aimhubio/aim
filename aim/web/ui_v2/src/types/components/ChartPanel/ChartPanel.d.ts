import React from 'react';

import { ChartTypeEnum } from 'utils/d3';
import { ILine, ILineChartProps } from 'types/components/LineChart/LineChart';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IProcessedData } from 'types/utils/d3/processData';
import {
  IAggregatedData,
  IAggregationConfig,
  IChartTooltip,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

export interface IChartPanelProps {
  chartType: ChartTypeEnum;
  // TODO after line model definition change to HighPlot Line type
  data: ILine[][] | any;
  focusedState: IFocusedState;
  tooltip: IChartTooltip;
  aggregatedData?: IAggregatedData[];
  aggregationConfig?: IAggregationConfig;
  // chartProps: Omit<
  //   ILineChartProps | IHighPlotProps,
  //   'data' | 'index' | 'syncHoverState'
  // >[];
  // TODO need to fix type later
  chartProps: any[];
  controls: React.ReactNode;
  onActivePointChange?: (
    activePoint: IActivePoint,
    focusedStateActive?: boolean,
  ) => void;
}

export interface IChartPanelRef {
  setActiveLineAndCircle?: (
    lineKey?: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ) => void;
  updateLines: (data: IProcessedData[]) => void;
}

export type IMemoizedForwardRefComponent<T> = React.MemoExoticComponent<
  React.ForwardRefExoticComponent<T & React.RefAttributes<unknown>>
>;

export interface IChartTypeConfig {
  [key: string]:
    | React.LazyExoticComponent<IMemoizedForwardRefComponent<ILineChartProps>>
    | React.LazyExoticComponent<IMemoizedForwardRefComponent<IHighPlotProps>>;
}
