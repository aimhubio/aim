export interface IExperimentCardProps {
  experimentsData: IExperimentData[] | [];
}

export interface IExperimentData {
  id: string;
  name: string;
  archived: boolean;
  run_count: number;
}
