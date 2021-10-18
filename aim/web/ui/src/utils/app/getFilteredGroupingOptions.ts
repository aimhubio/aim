import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

export function getFilteredGroupingOptions<M extends State>({
  groupName,
  model,
}: {
  groupName: GroupNameType;
  model: IModel<M>;
}): string[] {
  const modelState = model.getState();
  const grouping = modelState?.config?.grouping;
  if (grouping) {
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
    }
    return [];
  }
  return [];
}
