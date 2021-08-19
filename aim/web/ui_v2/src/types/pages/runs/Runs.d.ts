import { IRun } from 'types/services/models/metrics/runModel';
export interface IRunDetailParamsTabProps {
  runParams: { [key: string]: any };
}

export interface IRunsProps {
  runsData: IRun[];
}
export interface IRunDetailMetricsAndSystemTabProps {
  runHash: string;
  runTraces: any;
  runBatch: any;
  isSystem?: boolean = false;
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
