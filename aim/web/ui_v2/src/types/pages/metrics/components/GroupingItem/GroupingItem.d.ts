import React from 'react';
import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';

export interface IGroupingItemProps extends IGroupingPopoverProps {
  title: string;
  advancedTitle?: string;
  groupName: string;
  groupingData: IMetricAppConfig['grouping'];
  advancedComponent: React.FunctionComponentElement<React.ReactNode> | null;
  onReset: () => void;
  onVisibilityChange: () => void;
}
