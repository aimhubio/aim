import { getMetricHash } from './getMetricHash';

export function getMetricsRowData(metricsColumns: { [key: string]: any }): {
  [key: string]: string;
} {
  return Object.keys(metricsColumns).reduce(
    (acc: { [key: string]: any }, metricName: string) => {
      const groupByMetricName: { [key: string]: any } = {};
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
