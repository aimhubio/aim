import { systemMetricsDict } from 'config/systemMetrics/systemMetrics';

import { systemMetricsDictType } from 'types/utils/formatSystemMetricName';

export function formatSystemMetricName(metric: string): string {
  return systemMetricsDict[metric as keyof systemMetricsDictType] || metric;
}
