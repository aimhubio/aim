import React from 'react';

import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';

export interface IGroupingItemProps extends IGroupingPopoverProps {
  title: string;
  advancedTitle?: string;
  groupName: GroupNameType;
  groupingData: IMetricAppConfig['grouping'];
  advancedComponent?: React.FunctionComponentElement<React.ReactNode>;
  groupingSelectOptions: IGroupingSelectOption[];
  onReset: () => void;
  onVisibilityChange: () => void;
}
