export interface IProject {
  branches?: string[];
  description?: string;
  name?: string;
  path?: string;
  telemetry_enabled?: string | boolean;
  tf_enabled?: boolean;
}

export interface IParams {
  metrics: string[];
  params: unknown;
}

export interface IProjectsModelState {
  project?: IProject;
  params?: IParams;
}
