import { IExperimentData } from 'modules/core/api/experimentsApi/types';

export interface IExperimentNavigationPopoverProps {
  experimentsData: IExperimentData[] | null;
  experimentId: string;
  isExperimentsLoading: boolean;
  getExperimentsData: () => void;
}
