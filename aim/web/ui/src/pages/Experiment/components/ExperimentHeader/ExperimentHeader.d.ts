import { IExperimentData } from 'modules/core/api/experimentsApi/types';

export interface IExperimentHeaderProps {
  isExperimentLoading: boolean;
  experimentData: IExperimentData | null;
  isExperimentsLoading: boolean;
  experimentsData: IExperimentData[] | null;
  experimentId: string;
  getExperimentsData: () => void;
}
