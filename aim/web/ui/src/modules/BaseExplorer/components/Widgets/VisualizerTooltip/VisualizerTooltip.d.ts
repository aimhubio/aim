import React from 'react';

import { IWidgetComponentProps } from 'modules/BaseExplorer/types';

export interface IVisualizerTooltipProps extends IWidgetComponentProps {
  visualizationName: string;
  tooltipContentHeader?: React.ReactComponentElement;
}
