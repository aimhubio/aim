import { encode } from '../encoder/encoder';
import {
  IMetricAppConfig,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';

export function getGroupingPersistIndex({
  groupValues,
  groupKey,
  grouping,
  groupName,
}: {
  groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  };
  groupKey: string;
  grouping: IMetricAppConfig['grouping'];
  groupName: 'color' | 'stroke';
}) {
  const configHash = encode(groupValues[groupKey].config as {}, true);
  let index = BigInt(0);
  if (grouping?.hasOwnProperty('seed')) {
    for (let i = 0; i < configHash.length; i++) {
      const charCode = configHash.charCodeAt(i);
      if (charCode > 47 && charCode < 58) {
        index += BigInt(
          (charCode - 48) *
            Math.ceil(Math.pow(16, i) / grouping.seed[groupName]),
        );
      } else if (charCode > 96 && charCode < 103) {
        index += BigInt(
          (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
        );
      }
    }
  }

  return index;
}
