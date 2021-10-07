import * as analytics from 'services/analytics';
import { IOnTableDiffShowParams } from 'types/utils/app/onTableDiffShow';
import { IModel, State } from 'types/services/models/model';

export function onTableDiffShow<M extends State>(
  args: IOnTableDiffShowParams,
  model: IModel<M>,
  appName: string,
): void {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    args.onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent(`[${appName}Explorer][Table] Show table columns diff`);
}
