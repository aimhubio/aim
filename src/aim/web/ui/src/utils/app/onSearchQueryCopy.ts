import { IModel, State } from 'types/services/models/model';

import { onCopyToClipBoard } from 'utils/onCopyToClipBoard';

import onNotificationAdd from './onNotificationAdd';
import getQueryStringFromSelect from './getQueryStringFromSelect';

function onSearchQueryCopy<M extends State>(model: IModel<M>): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = getQueryStringFromSelect(selectedMetricsData);
  onCopyToClipBoard(query, false, () => onNotificationAdd, {
    notification: {
      id: Date.now(),
      severity: 'success',
      messages: ['Run Expression Copied'],
    },
    model,
  });
}

export default onSearchQueryCopy;
