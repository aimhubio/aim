import React from 'react';

import { ChartTypeEnum } from 'utils/d3';
import { ILine, ILineChartProps } from 'types/components/LineChart/LineChart';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IProcessedData } from 'types/utils/d3/processData';
import {
  IFocusedState,
  ITooltipContent,
} from 'types/services/models/metrics/metricsAppModel';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

export interface IChartPanelProps {
  chartType: ChartTypeEnum;
  // TODO after line model definition change to HighPlot Line type
  data: ILine[][] | any;
  focusedState: IFocusedState;
  tooltipContent: ITooltipContent;
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
  setActiveLine: (rowKey: string) => void;
  updateLines: (data: IProcessedData[]) => void;
}

interface IChartTypeConfig {
  [key: string]:
    | React.LazyExoticComponent<
        React.MemoExoticComponent<
          React.ForwardRefExoticComponent<
            ILineChartProps & React.RefAttributes<unknown>
          >
        >
      >
    | React.LazyExoticComponent<
        React.MemoExoticComponent<
          React.ForwardRefExoticComponent<
            IHighPlotProps & React.RefAttributes<unknown>
          >
        >
      >;
}
