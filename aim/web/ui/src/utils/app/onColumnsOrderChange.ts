import * as analytics from 'services/analytics';

import { isEmpty } from 'lodash-es';
import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onColumnsOrderChange<M extends State>(
  columnsOrder: any,
  model: IModel<M>,
) {
  const configData = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      columnsOrder: columnsOrder,
    };
    const config = {
      ...configData,
      table,
    };

    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
    // updateModelData(config);
  }
  if (
    isEmpty(columnsOrder?.left) &&
    isEmpty(columnsOrder?.middle) &&
    isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[MetricsExplorer][Table] Reset table columns order');
  }
}
