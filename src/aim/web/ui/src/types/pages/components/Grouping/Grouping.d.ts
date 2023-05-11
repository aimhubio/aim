import React from 'react';

import { IGroupingPopoverAdvancedProps } from 'components/GroupingPopover/GroupingPopover';

import { IGroupingConfig } from 'services/models/explorer/createAppModel';

import {
  GroupNameEnum,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IGroupingProps {
  groupingData: IGroupingConfig;
  groupingSelectOptions: IGroupingSelectOption[];
  onGroupingSelectChange: IMetricProps['onGroupingSelectChange'];
  onGroupingModeChange: IMetricProps['onGroupingModeChange'];
  onGroupingPaletteChange: IMetricProps['onGroupingPaletteChange'];
  onGroupingReset: IMetricProps['onGroupingReset'];
  onGroupingApplyChange: IMetricProps['onGroupingApplyChange'];
  onGroupingPersistenceChange: IMetricProps['onGroupingPersistenceChange'];
  onShuffleChange: IMetricProps['onShuffleChange'];
  groupingPopovers?: IGroupingPopovers[];
  isDisabled?: boolean;
}

export interface IGroupingPopovers {
  groupName: GroupNameEnum;
  title: string;
  inputLabel?: string;
  AdvancedComponent?: (
    props: IGroupingPopoverAdvancedProps,
  ) => React.FunctionComponentElement<React.ReactNode>;
}
