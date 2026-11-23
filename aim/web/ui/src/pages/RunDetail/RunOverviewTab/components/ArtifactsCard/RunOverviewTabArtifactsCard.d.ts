export interface IRunOverviewTabArtifactsCardProps {
  artifacts: Array<{ name: string; path: string; uri: string }>;
  isRunInfoLoading: boolean;
}
