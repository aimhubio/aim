import _ from 'lodash-es';

import { MetricsValueKeyEnum } from 'config/enums/tableEnums';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';

import { isSystemMetric } from 'utils/isSystemMetric';

import { getMetricHash } from './getMetricHash';
import { getMetricLabel } from './getMetricLabel';

export function getMetricsSelectOptions<M extends State>(
  metricsColumns: Record<string, any>,
  model: IModel<M>,
): IGroupingSelectOption[] {
  const metricsValueKey =
    model.getState()?.config?.table.metricsValueKey || MetricsValueKeyEnum.LAST;
  const metrics: IGroupingSelectOption[] = [];
  const systemMetrics: IGroupingSelectOption[] = [];
  Object.keys(metricsColumns).forEach((metricName: string) => {
    Object.keys(metricsColumns[metricName]).forEach((metricContext: string) => {
      const metricHash = getMetricHash(metricName, metricContext);
      const metricLabel = getMetricLabel(metricName, metricContext);
      const sortOption = {
        group: 'metrics',
        value: `metricsValues.${metricHash}.${metricsValueKey}`,
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
