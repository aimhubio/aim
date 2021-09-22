import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';

export function createRunModel(
  runData: IRun<IMetricTrace | IParamTrace>,
): IRun<IMetricTrace | IParamTrace> {
  return runData;
}
