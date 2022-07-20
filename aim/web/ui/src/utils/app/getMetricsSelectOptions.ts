import _ from 'lodash-es';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getMetricsSelectOptions(metricsColumns: {
  [key: string]: any;
}): IGroupingSelectOption[] {
  const metrics: IGroupingSelectOption[] = [];
  const systemMetrics: IGroupingSelectOption[] = [];
  Object.keys(metricsColumns).forEach((key: string) => {
    Object.keys(metricsColumns[key]).forEach((metricContext: string) => {
      const contextName = metricContext ? `_${metricContext}` : '';
      const sortOption = {
        group: 'metrics',
        value: `metricsLastValues.${key}${contextName}`,
        label: isSystemMetric(key)
          ? formatSystemMetricName(key)
          : `${key}${contextName}`,
      };
      if (isSystemMetric(key)) {
        systemMetrics.push(sortOption);
      } else {
        metrics.push(sortOption);
      }
    });
  });

  return [..._.sortBy(metrics, 'label'), ..._.sortBy(systemMetrics, 'label')];
}
