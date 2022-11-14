export interface IExperimentSettingsTabProps {
  experimentName: string;
  experimentDescription: string;
  updateExperiment: (name: string, description: string) => void;
}
