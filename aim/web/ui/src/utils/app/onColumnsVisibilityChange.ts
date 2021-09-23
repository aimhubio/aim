import * as analytics from 'services/analytics';
import { isEmpty } from 'lodash-es';

import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onColumnsVisibilityChange<T extends State>(
  hiddenColumns: string[],
  model: IModel<T>,
  appName: string,
) {
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
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem(`${appName}Table`, encode(table));
    // updateModelData(configUpdate);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent(`[${appName}Explorer][Table] Hide all table columns`);
  } else if (isEmpty(hiddenColumns)) {
    analytics.trackEvent(`[${appName}Explorer][Table] Show all table columns`);
  }
}
