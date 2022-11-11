import { createSearchExperimentRunsRequest } from 'modules/core/api/experimentsApi';
import createResource from 'modules/core/utils/createResource';

import { RequestOptions } from 'services/NetworkService';

import { IRun } from 'types/services/models/metrics/runModel';

function createExperimentContributionsFeedEngine() {
  let { call, cancel } = createSearchExperimentRunsRequest();

  const { fetchData, state, destroy } = createResource<IRun<unknown>[]>(
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
