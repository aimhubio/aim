import { RunsSearchQueryParams } from 'modules/core/api/runsApi';
import { QueryState } from 'modules/core/engine/explorer/query';

import { SequenceTypesEnum } from 'types/core/enums';

import { getQueryFromRanges } from './getQueryFromRanges';
import { getQueryStringFromSelect } from './getQueryStringFromSelect';

/**
 * function getQueryParamsFromState
 * this function is useful to generate run search query params from state object
 * @param {QueryState} stateObject - the state used for explorers over base
 * @param {SequenceTypesEnum} sequenceName - the name of sequence
 * @return {RunsSearchQueryParams}
 */
function getQueryParamsFromState(
  stateObject: QueryState,
  sequenceName: SequenceTypesEnum,
): RunsSearchQueryParams {
  return {
    q: getQueryStringFromSelect(stateObject.form, sequenceName),
    ...getQueryFromRanges(stateObject.ranges),
  };
}

export default getQueryParamsFromState;
