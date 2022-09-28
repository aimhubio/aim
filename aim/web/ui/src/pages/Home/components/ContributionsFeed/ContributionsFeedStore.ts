import {
  getProjectContributions,
  GetProjectContributionsResult,
} from 'modules/core/api/projectApi';
import { searchRun } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

function ContributionsFeedEngine() {
  const { fetchData, state } = createResource<any[]>(() =>
    searchRun({ exclude_params: true, exclude_traces: true }),
  );
  return {
    fetchContributionsFeed: fetchData,
    contributionsFeedState: state,
  };
}

export default ContributionsFeedEngine();
