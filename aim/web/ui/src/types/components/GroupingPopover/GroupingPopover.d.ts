import React from 'react';

import { IMetricProps } from 'types/pages/metrics/Metrics';
import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';

export interface IGroupingPopoverProps {
  groupName: GroupNameType;
  groupingData: any;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode> | null;
  groupingSelectOptions: IGroupingSelectOption[];
  onSelect: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
}

export interface IGroupingPopoverAdvancedProps {
  paletteIndex?: number;
  persistence?: boolean;
  groupingData: IMetricAppConfig['grouping'];
  onPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  onGroupingPaletteChange?: IMetricProps['onGroupingPaletteChange'];
  onShuffleChange: IMetricProps['onShuffleChange'];
}
