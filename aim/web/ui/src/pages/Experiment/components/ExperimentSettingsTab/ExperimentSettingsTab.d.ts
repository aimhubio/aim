export interface IExperimentSettingsTabProps {
  experimentName: string;
  description: string;
  updateExperiment: (name: string, description: string) => void;
}
