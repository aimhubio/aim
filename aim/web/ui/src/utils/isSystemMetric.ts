import { systemMetricsDict } from 'config/systemMetrics/systemMetrics';

import { systemMetricsDictType } from 'types/utils/formatSystemMetricName';

export function isSystemMetric(metric: string): boolean {
  return !!systemMetricsDict[metric as keyof systemMetricsDictType];
}
