import {
  getExperimentById,
  getExperiments,
  updateExperimentById,
  IExperimentData,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

function experimentEngine() {
  const {
    fetchData: fetchExperimentData,
    state: experimentState,
    destroy: destroyExperiment,
  } = createResource<IExperimentData>(getExperimentById);
  const {
    fetchData: fetchExperimentsData,
    state: experimentsState,
    destroy: destroyExperiments,
  } = createResource<IExperimentData[]>(getExperiments);

  function updateExperiment(name: string, description: string) {
    const experimentData = experimentState.getState().data;
    updateExperimentById(
      { name, description, archived: experimentData?.archived },
      experimentData?.id || '',
    ).then(() => {
      experimentState.setState((prev: any) => ({
        ...prev,
        data: { ...prev.data, name, description },
      }));
    });
  }

  return {
    fetchExperimentData,
    experimentState,
    destroyExperiment,
    fetchExperimentsData,
    experimentsState,
    destroyExperiments,
    updateExperiment,
  };
}

export default experimentEngine();
