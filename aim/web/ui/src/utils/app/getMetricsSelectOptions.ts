import _ from 'lodash-es';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import { getLabelAndValueOfMetric } from './getLabelAndValueOfMetric';

export function getMetricsSelectOptions(metricsColumns: {
  [key: string]: any;
}): IGroupingSelectOption[] {
  const metrics: IGroupingSelectOption[] = [];
  const systemMetrics: IGroupingSelectOption[] = [];
  Object.keys(metricsColumns).forEach((metricName: string) => {
    Object.keys(metricsColumns[metricName]).forEach((metricContext: string) => {
      const { key, label, isSystemMetric } = getLabelAndValueOfMetric(
        metricName,
        metricContext,
      );
      const sortOption = {
        group: 'metrics',
        value: `metricsLastValues.${key}`,
        label,
      };
      if (isSystemMetric) {
        systemMetrics.push(sortOption);
      } else {
        metrics.push(sortOption);
      }
    });
  });

  return [..._.sortBy(metrics, 'label'), ..._.sortBy(systemMetrics, 'label')];
}
