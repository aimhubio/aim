import { IModel, State } from 'types/services/models/model';

import onNotificationAdd from './onNotificationAdd';
import getQueryStringFromSelect from './getQueryStringFromSelect';

function onSearchQueryCopy<M extends State>(model: IModel<M>): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = getQueryStringFromSelect(selectedMetricsData);
  navigator.clipboard.writeText(query);
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'success',
      message: 'Run Expression Copied',
    },
    model,
  });
}

export default onSearchQueryCopy;
