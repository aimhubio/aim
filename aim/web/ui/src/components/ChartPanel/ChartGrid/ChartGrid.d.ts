import React from 'react';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import { IChartPanelProps } from 'types/components/ChartPanel/ChartPanel';
import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';

export interface IChartGridProps {
  data: IChartPanelProps['data'];
  chartType: IChartPanelProps['chartType'];
  chartProps: IChartPanelProps['chartProps'];
  chartRefs?: React.RefObject<any>[];
  chartPanelOffsetHeight?: number;
  nameKey?: string;
  readOnly?: boolean;
  syncHoverState?: (args: ISyncHoverStateArgs) => void;
  resizeMode?: ResizeModeEnum;
}
