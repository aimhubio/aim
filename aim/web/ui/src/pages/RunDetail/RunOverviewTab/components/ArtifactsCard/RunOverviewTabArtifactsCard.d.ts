export interface IRunOverviewTabArtifact {
  name: string;
  path: string;
  uri: string;
}

export type IRunOverviewTabArtifactRow = IRunOverviewTabArtifact & {
  key: string | number;
};

export interface IRunOverviewTabArtifactsCardProps {
  artifacts: IRunOverviewTabArtifact[];
  isRunInfoLoading: boolean;
}
