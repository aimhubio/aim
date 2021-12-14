import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StrokePopoverAdvanced from 'pages/Metrics/components/StrokePopover/StrokePopoverAdvanced';

import { IGroupingPopovers } from 'types/pages/components/Grouping/Grouping';

const GroupingPopovers: IGroupingPopovers[] = [
  {
    groupName: 'color',
    title: 'Run Color Settings',
    advancedTitle: 'Color Advanced Options',
    AdvancedComponent: ColorPopoverAdvanced,
  },
  {
    groupName: 'stroke',
    title: 'Select Fields For Grouping by stroke style',
    advancedTitle: 'stroke style advanced options',
    AdvancedComponent: StrokePopoverAdvanced,
  },
  {
    groupName: 'chart',
    title: 'Select fields to divide into charts',
  },
  {
    groupName: 'group',
    title: 'Select Fields For Grouping',
    advancedTitle: 'Select Fields For Grouping',
  },
];

export default GroupingPopovers;
