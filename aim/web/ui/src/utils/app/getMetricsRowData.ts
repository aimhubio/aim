import { encode } from 'utils/encoder/encoder';

export function getMetricsRowData(metricsColumns: { [key: string]: any }): any {
  return Object.keys(metricsColumns).reduce((acc: any, key: string) => {
    const groupByMetricName: any = {};
    Object.keys(metricsColumns[key]).forEach((metricContext: string) => {
      const contextName = metricContext ? ` ${metricContext}` : '';
      groupByMetricName[encode({ metricName: key, contextName })] = '-';
    });
    acc = { ...acc, ...groupByMetricName };
    return acc;
  }, {});
}
