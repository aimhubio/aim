import _ from 'lodash-es';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import { isSystemMetric } from 'utils/isSystemMetric';

import { getMetricHash } from './getMetricHash';
import { getMetricLabel } from './getMetricLabel';

export function getMetricsSelectOptions(metricsColumns: {
  [key: string]: any;
}): IGroupingSelectOption[] {
  const metrics: IGroupingSelectOption[] = [];
  const systemMetrics: IGroupingSelectOption[] = [];
  Object.keys(metricsColumns).forEach((metricName: string) => {
    Object.keys(metricsColumns[metricName]).forEach((metricContext: string) => {
      const metricHash = getMetricHash(metricName, metricContext);
      const metricLabel = getMetricLabel(metricName, metricContext);
      const sortOption = {
        group: 'metrics',
        value: `metricsLastValues.${metricHash}`,
        label: metricLabel,
      };
      if (isSystemMetric(metricName)) {
        systemMetrics.push(sortOption);
      } else {
        metrics.push(sortOption);
      }
    });
  });

  return [..._.sortBy(metrics, 'label'), ..._.sortBy(systemMetrics, 'label')];
}
