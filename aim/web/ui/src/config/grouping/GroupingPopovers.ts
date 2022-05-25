import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StrokePopoverAdvanced from 'pages/Metrics/components/StrokePopover/StrokePopoverAdvanced';

import { IGroupingPopovers } from 'types/pages/components/Grouping/Grouping';

const GroupingPopovers: IGroupingPopovers[] = [
  {
    groupName: 'color',
    title: 'Group by color',
    AdvancedComponent: ColorPopoverAdvanced,
  },
  {
    groupName: 'stroke',
    title: 'Group by stroke style',
    AdvancedComponent: StrokePopoverAdvanced,
  },
  {
    groupName: 'chart',
    title: 'Divide into charts',
    inputLabel: 'Select fields to divide into charts',
  },
  {
    groupName: 'row',
    title: 'Group by row',
  },
];

export default GroupingPopovers;
