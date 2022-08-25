import _ from 'lodash-es';

import contextToString from 'utils/contextToString';
import { encode } from 'utils/encoder/encoder';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getMetricHash(
  metricKey: string,
  context: { [key: string]: string } | string,
): string {
  const contextName = !_.isEmpty(context)
    ? ` ${typeof context === 'string' ? context : contextToString(context)}`
    : '';
  const metricName = isSystemMetric(metricKey)
    ? formatSystemMetricName(metricKey)
    : metricKey;
  return isSystemMetric(metricKey)
    ? metricKey
    : encode({ metricName, contextName });
}
