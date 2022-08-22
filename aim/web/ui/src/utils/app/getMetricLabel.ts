import _ from 'lodash';

import contextToString from 'utils/contextToString';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getMetricLabel(
  metricKey: string,
  context: { [key: string]: string } | string,
): string {
  const contextName = !_.isEmpty(context)
    ? ` ${typeof context === 'string' ? context : contextToString(context)}`
    : '';
  const metricName = isSystemMetric(metricKey)
    ? formatSystemMetricName(metricKey)
    : metricKey;
  return metricName + contextName;
}
