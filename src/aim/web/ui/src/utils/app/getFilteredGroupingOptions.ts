import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import { IModel, State } from 'types/services/models/model';

export function getFilteredGroupingOptions<M extends State>({
  groupName,
  model,
}: {
  groupName: GroupNameEnum;
  model: IModel<M>;
}): string[] {
  const modelState = model.getState();
  const grouping = modelState?.config?.grouping;
  if (grouping) {
    const {
      //  reverseMode,
      isApplied,
    } = grouping;
    const groupingSelectOptions = model.getState()?.groupingSelectOptions;
    if (groupingSelectOptions) {
      //ToDo reverse mode
      // const filteredOptions = [...groupingSelectOptions]
      //   .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
      //   .map((item) => item.value);
      //ToDo reverse mode
      // return isApplied[groupName]
      //   ? reverseMode[groupName]
      //     ? filteredOptions
      //     : grouping[groupName]
      //   : [];
      return isApplied[groupName] ? grouping[groupName] : [];
    }
    return [];
  }
  return [];
}
