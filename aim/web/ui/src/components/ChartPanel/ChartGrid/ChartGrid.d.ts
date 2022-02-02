import React from 'react';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';

export interface IChartGridProps {
  data: IChartPanelProps['data'];
  chartType: IChartPanelProps['chartType'];
  chartProps: IChartPanelProps['chartProps'];
  chartRefs?: React.RefObject<any>[];
  nameKey?: string;
  componentProps?: {};
  syncHoverState?: (args: ISyncHoverStateArgs) => void;
}
