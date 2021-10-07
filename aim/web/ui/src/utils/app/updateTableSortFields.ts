import * as analytics from 'services/analytics';
import { isEmpty } from 'lodash-es';

import { SortField } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function updateSortFields<M extends State>(
  sortFields: SortField[],
  model: IModel<M>,
  appName: string,
): void {
  const configData = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      sortFields,
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
  analytics.trackEvent(
    `[${appName}Explorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}
