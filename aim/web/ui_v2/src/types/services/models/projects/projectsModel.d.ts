export interface IProject {
  branches?: string[];
  description?: string;
  name?: string;
  path?: string;
  telemetry_enabled?: string | boolean;
}

export interface IParams {
  metrics: string[];
  params: unknown;
}

export interface IProjectsModelState {
  project?: IProject;
  params?: IParams;
}
