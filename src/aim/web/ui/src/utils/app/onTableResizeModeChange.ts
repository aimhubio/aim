import { ResizeModeEnum } from 'config/enums/tableEnums';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';

import { setItem } from '../storage';
import { encode } from '../encoder/encoder';

export default function onTableResizeModeChange<M extends State>({
  mode,
  model,
  appName,
}: {
  mode: ResizeModeEnum;
  model: IModel<M>;
  appName: string;
}): void {
  const configData = model?.getState()?.config;

  if (configData?.table) {
    const table = {
      ...configData.table,
      resizeMode: mode,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
  }
  // @ts-ignore
  analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.changeResizeMode);
}
