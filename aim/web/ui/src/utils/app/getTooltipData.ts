import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricsCollection,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import getGroupConfig from './getGroupConfig';

export default function getTooltipData<D, M extends State>({
  processedData,
  paramKeys,
  groupingSelectOptions,
  groupingItems = [],
  model,
}: {
  processedData: IMetricsCollection<D>[];
  paramKeys: string[];
  groupingSelectOptions: IGroupingSelectOption[];
  groupingItems: GroupNameType[];
  model: IModel<M>;
}): ITooltipData {
  const data: ITooltipData = {};

  for (let collection of processedData) {
    const groupConfig = getGroupConfig({
      collection,
      groupingSelectOptions,
      groupingItems,
      model,
    });

    for (let itemData of collection.data as any) {
      data[itemData.key] = {
        runHash: itemData.run.hash,
        name: itemData.name,
        context: itemData.context,
        step: itemData.step,
        index: itemData.index,
        caption: itemData.caption,
        images_name: itemData.name,
        groupConfig,
        run: itemData.run,
      };
    }
  }

  return data;
}
