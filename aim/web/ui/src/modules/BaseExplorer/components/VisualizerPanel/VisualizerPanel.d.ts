import * as React from 'react';

import { IControlsProps, IGroupingProps } from 'modules/BaseExplorer/types';

export interface IVisualizerPanelProps {
  engine: any;
  grouping: React.FunctionComponent<IGroupingProps> | null;
  controls?: React.FunctionComponent<IControlsProps>;
  visualizationName: string;
}
