import {
  getProjectContributions,
  GetProjectContributionsResult,
} from 'modules/core/api/projectApi';
import createResource from 'modules/core/utils/createResource';

function projectContributionsEngine() {
  const { fetchData, state, destroy } =
    createResource<GetProjectContributionsResult>(getProjectContributions);
  return {
    fetchProjectContributions: fetchData,
    projectContributionsState: state,
    destroy,
  };
}

export default projectContributionsEngine();
