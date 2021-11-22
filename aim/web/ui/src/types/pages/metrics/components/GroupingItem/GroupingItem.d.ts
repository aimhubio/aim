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
  groupDisplayName: string;
  groupingData: IMetricAppConfig['grouping'];
  advancedComponent: React.FunctionComponentElement<React.ReactNode> | null;
  groupingSelectOptions: IGroupingSelectOption[];
  onReset: () => void;
  onVisibilityChange: () => void;
}
