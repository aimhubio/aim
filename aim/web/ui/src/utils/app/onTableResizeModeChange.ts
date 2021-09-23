import * as analytics from 'services/analytics';
import { IMetricAppConfig } from 'types/services/models/metrics/metricsAppModel';
import { setItem } from '../storage';
import { encode } from '../encoder/encoder';
import { IOnTableResizeModeChangeParams } from 'types/utils/app/onTableResizeModeChange';

export default function onTableResizeModeChange(
  params: IOnTableResizeModeChangeParams,
): void {
  const configData: IMetricAppConfig | undefined =
    params.model.getState()?.config;

  if (configData?.table) {
    const table = {
      ...configData.table,
      resizeMode: params.mode,
    };
    const config = {
      ...configData,
      table,
    };
    params.model.setState({
      config,
    });
    setItem(`${params.page}Table`, encode(table));
  }
  analytics.trackEvent(
    `[${params.page}Explorer][Table] Set table view mode to "${params.mode}"`,
  );
}
