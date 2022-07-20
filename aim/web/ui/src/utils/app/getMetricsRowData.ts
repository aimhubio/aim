import { encode } from 'utils/encoder/encoder';
import { isSystemMetric } from 'utils/isSystemMetric';

export function getMetricsRowData(metricsColumns: { [key: string]: any }): {
  [key: string]: string;
} {
  return Object.keys(metricsColumns).reduce((acc: any, key: string) => {
    const groupByMetricName: any = {};
    Object.keys(metricsColumns[key]).forEach((metricContext: string) => {
      const contextName = metricContext ? ` ${metricContext}` : '';
      groupByMetricName[
        isSystemMetric(key) ? key : encode({ metricName: key, contextName })
      ] = '-';
    });
    acc = { ...acc, ...groupByMetricName };
    return acc;
  }, {});
}
