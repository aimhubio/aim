import { isEmpty } from 'lodash-es';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onColumnsVisibilityChange<M extends State>({
  hiddenColumns,
  model,
  appName,
  updateModelData,
}: {
  hiddenColumns: string[];
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  const columnsData = model.getState()!.tableColumns!;
  if (configData?.table) {
    const table = {
      ...configData.table,
      hiddenColumns:
        hiddenColumns[0] === 'all'
          ? columnsData.map((col) => col.key)
          : hiddenColumns,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent(`[${appName}Explorer][Table] Hide all table columns`);
  } else if (isEmpty(hiddenColumns)) {
    analytics.trackEvent(`[${appName}Explorer][Table] Show all table columns`);
  }
}
