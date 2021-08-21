import { ScaleEnum } from 'utils/d3';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { IMetricsCollection } from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';

export interface IAggregateGroupDataParams {
  groupData: IMetricsCollection<IMetric>[];
  methods: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  };
  scale: {
    xAxis: ScaleEnum;
    yAxis: ScaleEnum;
  };
}
