import React from 'react';
import { IMetricProps } from 'types/pages/metrics/Metrics';

export interface IGroupingPopoverProps {
  selectOptions: IMetricProps['groupingSelectOptions'];
  selectedValues: string[];
  onSelect: IMetricProps['onGroupingSelectChange'];
  groupName: IOnGroupingSelectChangeParams['field'];
  advancedComponent?: React.FunctionComponentElement<React.ReactNode>;
}
