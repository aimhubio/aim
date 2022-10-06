import {
  getExperiments,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

function createExperimentsEngine() {
  const { fetchData, state, destroy } =
    createResource<IExperimentData[]>(getExperiments);
  return { fetchExperiments: fetchData, experimentsState: state, destroy };
}

export default createExperimentsEngine();
