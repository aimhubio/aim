import { getFilteredGroupingOptions } from './getFilteredGroupingOptions';
import { IModel, State } from 'types/services/models/model';

export default function isGroupingApplied<T extends State>(
  model: IModel<T>,
): boolean {
  const groupByColor = getFilteredGroupingOptions('color', model);
  const groupByStroke = getFilteredGroupingOptions('stroke', model);
  const groupByChart = getFilteredGroupingOptions('chart', model);
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return false;
  }
  return true;
}
