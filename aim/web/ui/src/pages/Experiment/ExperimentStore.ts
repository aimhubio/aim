import {
  getExperimentById,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

function experimentEngine() {
  const { fetchData, state, destroy } = createResource<IExperimentData>(
    getExperimentById as any,
  );
  return {
    fetchExperimentData: fetchData,
    experimentState: state,
    destroy,
  };
}

export default experimentEngine();
