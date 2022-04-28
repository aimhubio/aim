import _ from 'lodash';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onAxisBrashExtentChange<M extends State>({
  key,
  extent,
  model,
  updateModelData,
}: {
  key: string;
  extent: [number, number];
  model: IModel<M>;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.chart) {
    let brushExtents = { ...configData.chart.brushExtents };
    if (_.isNil(extent)) {
      brushExtents = _.omit(brushExtents, key);
    } else {
      brushExtents[key] = extent;
    }

    configData.chart.brushExtents = brushExtents;

    updateModelData({ ...configData, chart: { ...configData?.chart } }, true);
  }
}
