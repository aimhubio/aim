import * as analytics from 'services/analytics';

import _ from 'lodash-es';
import { IModel, State } from 'types/services/models/model';
import { encode } from 'utils/encoder/encoder';
import { setItem } from 'utils/storage';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onColumnsOrderChange<M extends State>({
  columnsOrder,
  model,
  appName,
  updateModelData,
}: {
  columnsOrder: any;
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
