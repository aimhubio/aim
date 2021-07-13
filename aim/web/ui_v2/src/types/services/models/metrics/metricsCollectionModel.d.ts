import { IMetric } from './metricModel';
import { IRun } from './runModel';

export interface IMetricCollectionModel {
  rawData: IRun[];
  config: IMetricCollectionConfig;
  collection: IMetric[][];
}

interface IMetricCollectionConfig {
  grouping: {
    color: string[];
    style: string[];
    chart: string[];
  };
}
