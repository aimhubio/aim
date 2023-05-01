import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import { IModel, State } from 'types/services/models/model';

import { getFilteredGroupingOptions } from './getFilteredGroupingOptions';

export default function isGroupingApplied<M extends State>(
  model: IModel<M>,
): boolean {
  const groupByColor = getFilteredGroupingOptions({
    groupName: GroupNameEnum.COLOR,
    model,
  });
  const groupByStroke = getFilteredGroupingOptions({
    groupName: GroupNameEnum.STROKE,
    model,
  });
  const groupByChart = getFilteredGroupingOptions({
    groupName: GroupNameEnum.CHART,
    model,
  });
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return false;
  }
  return true;
}
