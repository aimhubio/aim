import React from 'react';

import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';
import { IGroupingConfig } from 'types/services/models/explorer/createAppModel';

export interface IGroupingItemProps extends IGroupingPopoverProps {
  title: string;
  inputLabel?: string;
  isDisabled: boolean;
  groupName: GroupNameEnum;
  groupingData: IGroupingConfig;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode>;
  groupingSelectOptions: IGroupingSelectOption[];
  onReset: () => void;
  onVisibilityChange: () => void;
}
