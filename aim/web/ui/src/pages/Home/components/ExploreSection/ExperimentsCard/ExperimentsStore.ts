import {
  getExperiments,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

function createExperimentsEngine() {
  const { fetchData, state } =
    createResource<IExperimentData[]>(getExperiments);
  return { fetchExperiments: fetchData, experimentsState: state };
}

export default createExperimentsEngine();
