import { isEmpty } from 'lodash-es';

import * as analytics from 'services/analytics';

import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export default function onSortFieldsChange<M extends State>({
  sortFields,
  model,
  appName,
  updateModelData,
}: {
  sortFields: [string, any][];
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
}) {
  const configData = model.getState()?.config;
  if (configData?.table) {
    const configUpdate = {
      ...configData,
      table: {
        ...configData.table,
        sortFields: sortFields,
      },
    };
    model.setState({ config: configUpdate });
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[${appName}Explorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}
