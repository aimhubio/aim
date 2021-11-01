import { IModel, State } from 'types/services/models/model';

import { getFilteredGroupingOptions } from './getFilteredGroupingOptions';

export default function isGroupingApplied<M extends State>(
  model: IModel<M>,
): boolean {
  const groupByColor = getFilteredGroupingOptions({
    groupName: 'color',
    model,
  });
  const groupByStroke = getFilteredGroupingOptions({
    groupName: 'stroke',
    model,
  });
  const groupByChart = getFilteredGroupingOptions({
    groupName: 'chart',
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
