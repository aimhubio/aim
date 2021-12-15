import React from 'react';

import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import {
  GroupNameType,
  IGroupingSelectOption,
} from 'types/services/models/metrics/metricsAppModel';
import { IGroupingConfig } from 'types/services/models/explorer/createAppModel';

export interface IGroupingItemProps extends IGroupingPopoverProps {
  title: string;
  advancedTitle?: string;
  groupName: GroupNameType;
  groupingData: IGroupingConfig;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode>;
  groupingSelectOptions: IGroupingSelectOption[];
  onReset: () => void;
  onVisibilityChange: () => void;
}
