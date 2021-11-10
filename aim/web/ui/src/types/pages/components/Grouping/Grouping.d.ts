import React from 'react';

import { IGroupingPopoverAdvancedProps } from 'components/GroupingPopover/GroupingPopover';

import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IGroupingProps {
  groupingData: IMetricAppConfig['grouping'];
  groupingSelectOptions: IGroupingSelectOption[];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
  onGroupingPaletteChange: IMetricProps['onGroupingPaletteChange'];
  onGroupingReset: IMetricProps['onGroupingReset'];
  onGroupingApplyChange: IMetricAppConfig['onGroupingApplyChange'];
  onGroupingPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  onShuffleChange: IMetricProps['onShuffleChange'];
  groupingPopovers?: IGroupingPopovers[];
}

export interface IGroupingPopovers {
  groupName: GroupNameType;
  title: string;
  advancedTitle?: string;
  AdvancedComponent?: (
    props: IGroupingPopoverAdvancedProps,
  ) => React.FunctionComponentElement<React.ReactNode>;
}
