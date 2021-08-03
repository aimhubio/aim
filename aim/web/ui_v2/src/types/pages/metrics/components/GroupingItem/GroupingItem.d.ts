import React from 'react';
import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import {
  groupNames,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';

export interface IGroupingItemProps extends IGroupingPopoverProps {
  title: string;
  advancedTitle?: string;
  groupName: groupNames;
  groupingData: IMetricAppConfig['grouping'];
  advancedComponent: React.FunctionComponentElement<React.ReactNode> | null;
  onReset: () => void;
  onVisibilityChange: () => void;
}
