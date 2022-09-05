import createResource from 'modules/core/utils/createResource';

import experimentsService from 'services/api/experiments/experimentsService';

import { IExperimentData } from './ExperimentsCard.d';

export interface State<T> {
  data: T[];
  loading: boolean;
  error: any;
}

function createExperimentsEngine() {
  const { fetchData, state } = createResource<IExperimentData>(
    experimentsService.getExperimentsData,
  );
  return { fetchExperiments: fetchData, experimentsState: state };
}

export default createExperimentsEngine();
