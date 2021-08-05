import React from 'react';

import { ILine, ILineChartProps } from '../LineChart/LineChart';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { ChartTypeEnum } from 'utils/d3';
import { IProcessedData } from 'types/utils/d3/processData';
import { IFocusedState } from '../../services/models/metrics/metricsAppModel';

export interface IChartPanelProps {
  chartType: ChartTypeEnum;
  // TODO after line model definition change to HighPlot Line type
  data: ILine[][] | any;
  focusedState: IFocusedState;
  chartProps: Omit<
    ILineChartProps | IHighPlotProps,
    'data' | 'index' | 'syncHoverState'
  >[];
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
  [key: string]: React.LazyExoticComponent<any>;
}
