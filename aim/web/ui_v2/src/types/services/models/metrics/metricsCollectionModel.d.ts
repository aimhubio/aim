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

export interface IMetricTableRowData {
  key: string;
  dasharray: metric.dasharray;
  color: metric.color;
  experiment: metric.run.experiment_name;
  run: metric.run.name;
  metric: metric.metric_name;
  context: string[];
  value: string;
  iteration: string;
}
