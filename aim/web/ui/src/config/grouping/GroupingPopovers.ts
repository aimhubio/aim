import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StrokePopoverAdvanced from 'pages/Metrics/components/StrokePopover/StrokePopoverAdvanced';

import { IGroupingPopovers } from 'types/pages/components/Grouping/Grouping';

const GroupingPopovers: IGroupingPopovers[] = [
  {
    groupName: 'color',
    title: 'Run Color Settings',
    AdvancedComponent: ColorPopoverAdvanced,
  },
  {
    groupName: 'stroke',
    title: 'Select Fields For Grouping by stroke style',
    AdvancedComponent: StrokePopoverAdvanced,
  },
  {
    groupName: 'chart',
    title: 'Select fields to divide into charts',
    inputLabel: 'Select fields to divide into charts',
  },
  {
    groupName: 'row',
    title: 'Select Fields For Grouping By Row',
  },
];

export default GroupingPopovers;
