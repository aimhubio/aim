import { RunsSearchQueryParams } from 'modules/core/api/runsApi';
import { QueryState } from 'modules/core/engine/explorer/query';

import { getQueryFromRanges } from './getQueryFromRanges';
import { getQueryStringFromSelect } from './getQueryStringFromSelect';

/**
 * function getQueryParamsFromState
 * this function is useful to generate run search query params from state object
 * @param {QueryState} stateObject - the state used for explorers over base
 * @return {RunsSearchQueryParams}
 */
function getQueryParamsFromState(
  stateObject: QueryState,
): RunsSearchQueryParams {
  return {
    q: getQueryStringFromSelect(stateObject.form),
    ...getQueryFromRanges(stateObject.ranges),
  };
}

export default getQueryParamsFromState;
