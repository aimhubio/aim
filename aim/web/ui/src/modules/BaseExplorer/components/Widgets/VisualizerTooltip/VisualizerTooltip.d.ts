import React from 'react';

import {
  IBaseComponentProps,
  IWidgetComponentProps,
} from 'modules/BaseExplorer/types';

export interface IVisualizerTooltipProps
  extends IWidgetComponentProps,
    IBaseComponentProps {
  visualizationName: string;
  tooltipContentHeader?: React.ReactComponentElement;
}
