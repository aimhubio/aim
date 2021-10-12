import * as analytics from 'services/analytics';

import { isEmpty } from 'lodash';
import { IModel, State } from 'types/services/models/model';

export default function onSortFieldsChange<M extends State>(
  sortFields: [string, any][],
  model: IModel<M>,
  appName: string,
  updateModelData: any,
) {
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
