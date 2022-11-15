import {
  createSearchExperimentRunsRequest,
  ExperimentRun,
} from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

import { RequestOptions } from 'services/NetworkService';

function createExperimentContributionsFeedEngine() {
  let { call } = createSearchExperimentRunsRequest();

  const { fetchData, state, destroy } = createResource<ExperimentRun[]>(
    async (experimentId: string, queryParams: RequestOptions['query_params']) =>
      await call(experimentId, queryParams),
  );
  return {
    fetchExperimentContributionsFeed: (
      experimentId: string,
      queryParams: RequestOptions['query_params'],
    ) => fetchData({ experimentId, queryParams }),
    experimentContributionsFeedState: state,
    destroy,
  };
}

export default createExperimentContributionsFeedEngine();
