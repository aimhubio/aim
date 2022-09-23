import { getMetricHash } from './getMetricHash';

export function getMetricsInitialRowData(
  metricsColumns: Record<string, any>,
): Record<string, string> {
  return Object.keys(metricsColumns).reduce(
    (acc: Record<string, any>, metricName: string) => {
      const groupByMetricName: Record<string, any> = {};
      Object.keys(metricsColumns[metricName]).forEach(
        (metricContext: string) => {
          const metricHash = getMetricHash(metricName, metricContext);
          groupByMetricName[metricHash] = '-';
        },
      );
      acc = { ...acc, ...groupByMetricName };
      return acc;
    },
    {},
  );
}
