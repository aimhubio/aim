import {
  getProjectContributions,
  GetProjectContributionsResult,
} from 'modules/core/api/projectApi';
import createResource from 'modules/core/utils/createResource';

function projectContributionsEngine() {
  const { fetchData, state } = createResource<GetProjectContributionsResult>(
    getProjectContributions,
  );
  return {
    fetchProjectContributions: fetchData,
    projectContributionsState: state,
  };
}

export default projectContributionsEngine();
