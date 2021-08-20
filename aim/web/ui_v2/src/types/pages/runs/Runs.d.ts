import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';
export interface IRunDetailParamsTabProps {
  runParams: { [key: string]: any };
}

export interface IRunsProps {
  runsData: IRun<IMetricTrace | IParamTrace>[];
}
export interface IRunDetailMetricsAndSystemTabProps {
  runHash: string;
  runTraces: any;
  runBatch: any;
  isSystem?: boolean;
}
export interface IRunDetailSettingsTabProps {
  runHash: string;
  isArchived: boolean;
}

export interface IRunBatch {
  context: { [key: string]: string };
  iters: number[];
  metric_name: string;
  values: number[];
}
