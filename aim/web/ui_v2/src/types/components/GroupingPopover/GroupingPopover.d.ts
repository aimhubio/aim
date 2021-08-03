import React from 'react';
import { IMetricProps } from 'types/pages/metrics/Metrics';
import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export interface IGroupingPopoverProps {
  groupName: IOnGroupingSelectChangeParams['field'];
  groupingData: IMetricAppConfig['grouping'];
  advancedComponent?: React.FunctionComponentElement<React.ReactNode> | null;
  onSelect: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
}

export interface IGroupingPopoverAdvancedProps {
  paletteIndex?: number;
  persistence?: boolean;
  onPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  onGroupingPaletteChange?: IMetricProps['onGroupingPaletteChange'];
}
