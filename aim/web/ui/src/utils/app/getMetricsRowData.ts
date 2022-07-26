import { getLabelAndValueOfMetric } from './getLabelAndValueOfMetric';

export function getMetricsRowData(metricsColumns: { [key: string]: any }): {
  [key: string]: string;
} {
  return Object.keys(metricsColumns).reduce(
    (acc: { [key: string]: any }, metricName: string) => {
      const groupByMetricName: { [key: string]: any } = {};
      Object.keys(metricsColumns[metricName]).forEach(
        (metricContext: string) => {
          const { key } = getLabelAndValueOfMetric(metricName, metricContext);
          groupByMetricName[key] = '-';
        },
      );
      acc = { ...acc, ...groupByMetricName };
      return acc;
    },
    {},
  );
}
