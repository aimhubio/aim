import * as analytics from 'services/analytics';
import { IOnTableDiffShowParams } from 'types/utils/app/onTableDiffShow';

export function onTableDiffShow(params: IOnTableDiffShowParams): void {
  const sameValueColumns = params.model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    params.onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent(
    `[${params.page}Explorer][Table] Show table columns diff`,
  );
}
