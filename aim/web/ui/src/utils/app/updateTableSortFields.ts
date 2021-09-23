import * as analytics from 'services/analytics';
import { isEmpty } from 'lodash-es';

import { SortField } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function updateSortFields<T extends State>(
  sortFields: SortField[],
  model: IModel<T>,
  page: string,
) {
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

    setItem(`${page}Table`, encode(table));
    // updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[${page}Explorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}
