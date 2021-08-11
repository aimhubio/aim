import { ScaleEnum } from 'utils/d3';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import { IMetricsCollection } from 'types/services/models/metrics/metricsAppModel';

export interface IAggregateGroupDataParams {
  groupData: IMetricsCollection[];
  methods: {
    area: AggregationAreaMethods;
    line: AggregationLineMethods;
  };
  scale: {
    xAxis: ScaleEnum;
    yAxis: ScaleEnum;
  };
}
