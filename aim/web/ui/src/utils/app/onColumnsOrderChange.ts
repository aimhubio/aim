import * as analytics from 'services/analytics';

import _ from 'lodash-es';
import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';

export default function onColumnsOrderChange<M extends State>(
  columnsOrder: any,
  model: IModel<M>,
  appName: string,
  updateModelData: any,
): void {
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
    setItem(`${appName}Table`, encode(table));
    updateModelData(config);
  }
  if (
    _.isEmpty(columnsOrder?.left) &&
    _.isEmpty(columnsOrder?.middle) &&
    _.isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[MetricsExplorer][Table] Reset table columns order');
  }
}
