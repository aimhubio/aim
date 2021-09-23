import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IModel } from 'types/services/models/model';

export function getFilteredGroupingOptions(
  groupName: GroupNameType,
  model: IModel<any>,
): string[] {
  const modelState = model.getState();
  const grouping = modelState?.config?.grouping;
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
      .map((item) => item.value);
    return isApplied[groupName]
      ? reverseMode[groupName]
        ? filteredOptions
        : grouping[groupName]
      : [];
  } else {
    return [];
  }
}
