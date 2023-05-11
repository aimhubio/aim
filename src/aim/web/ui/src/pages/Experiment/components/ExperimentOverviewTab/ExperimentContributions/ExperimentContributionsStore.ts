import {
  GetExperimentContributionsResult,
  getExperimentContributions,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

function experimentContributionsEngine() {
  const { fetchData, state, destroy } =
    createResource<GetExperimentContributionsResult>(
      getExperimentContributions,
    );
  return {
    fetchExperimentContributions: (experimentId: string) =>
      fetchData(experimentId),
    experimentContributionsState: state,
    destroy,
  };
}

export default experimentContributionsEngine();
