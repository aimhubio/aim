import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import resetChartZoom from './resetChartZoom';

export default function onGroupingSelectChange<M extends State>({
  groupName,
  list,
  model,
  appName,
  updateModelData,
  setAggregationEnabled,
}: {
  groupName: GroupNameEnum;
  list: string[];
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  setAggregationEnabled?: any;
}) {
  let configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    configData = resetChartZoom({ configData, appName });
    if (typeof setAggregationEnabled === 'function') {
      setAggregationEnabled({ model, appName });
    }
    updateModelData(configData, true);
  }
  analytics.trackEvent(`[${appName}Explorer] Group by ${groupName}`);
  // doesnt need additional key for tracking, just didnt removed this line
}
