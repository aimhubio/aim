export interface IProject {
  branches?: string[];
  description?: string;
  name?: string;
  path?: string;
  telemetry_enabled?: string | boolean;
  warn_index?: boolean;
  warn_runs?: boolean;
}

export interface IProjectParamsMetrics {
  metric: { [key: string]: { [key: string]: string }[] };
  images: { [key: string]: { [key: string]: string }[] };
  params: { [key: string]: any };
}

export interface IProjectsModelState {
  project?: IProject;
  params?: IProjectParamsMetrics['params'];
  images?: IProjectParamsMetrics['params'];
  metrics?: IProjectParamsMetrics['metric'];
  pinnedSequences: IPinnedSequence[];
}

export interface IPinnedSequence {
  name: string;
  context: { [key: string]: unknown };
}

export interface IPinnedSequencesResData {
  sequences: IPinnedSequence[];
}
