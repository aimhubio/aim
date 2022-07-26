import _ from 'lodash';

import contextToString from 'utils/contextToString';
import { encode } from 'utils/encoder/encoder';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getLabelAndValueOfMetric(
  metricKey: string,
  context: { [key: string]: string } | string,
): { label: string; key: string; isSystemMetric: boolean } {
  const contextName = !_.isEmpty(context)
    ? ` ${typeof context === 'string' ? context : contextToString(context)}`
    : '';
  const metricName = isSystemMetric(metricKey)
    ? formatSystemMetricName(metricKey)
    : metricKey;
  return {
    label: metricName + contextName,
    key: isSystemMetric(metricKey)
      ? metricKey
      : encode({ metricName, contextName }),
    isSystemMetric: isSystemMetric(metricKey),
  };
}
