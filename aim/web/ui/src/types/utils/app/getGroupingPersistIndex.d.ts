import { IMetric } from 'services/models/metrics/metricModel';
import {
  IMetricAppConfig,
  IMetricsCollection,
} from 'services/models/metrics/metricsAppModel';

export interface IGetGroupingPersistIndex {
  groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  };
  groupKey: string;
  grouping: IMetricAppConfig['grouping'];
  groupName: string;
}
