import { isEmpty } from 'lodash-es';

import * as analytics from 'services/analytics';

import { SortField } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function updateSortFields<M extends State>({
  sortFields,
  model,
  appName,
  updateModelData,
}: {
  sortFields: SortField[];
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}): void {
  const configData = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      sortFields,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });

    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}
