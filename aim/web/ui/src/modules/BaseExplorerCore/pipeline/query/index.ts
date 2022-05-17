// @TODO implement live update in this file

import { memoize } from 'modules/BaseExplorerCore/cache';

import {
  createSearchRunsRequest,
  RunsSearchQueryParams,
} from 'services/api/base-explorer/runsApi';
import { RequestInstance } from 'services/NetworkService/types';

import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';

type Query = {
  execute: (params: RunsSearchQueryParams) => Promise<unknown>;
  cancel: () => void;
};

let currentQueryRequest: RequestInstance;
let currentSequenceType: SequenceTypesEnum;

async function executeBaseQuery(
  query: RunsSearchQueryParams,
): Promise<unknown> {
  cancel();
  const data: ReadableStream<any> = await currentQueryRequest.call(query);
  return parseStream(data);
}

function setCurrentSequenceType(sequenceType: SequenceTypesEnum) {
  currentSequenceType = sequenceType;
}

function createQueryRequest() {
  currentQueryRequest = createSearchRunsRequest(currentSequenceType);
}

/**
 * function cancel
 * This function is useful to abort api request
 */
function cancel() {
  if (currentQueryRequest) {
    currentQueryRequest.cancel();
    createQueryRequest();
  }
}

/**
 *
 * @param {SequenceTypesEnum} sequenceType - sequence name
 * @param {Boolean} useCache - boolean value to indicate query need to be  cached or not
 */
function createQuery(
  sequenceType: SequenceTypesEnum,
  useCache: boolean = false,
): Query {
  setCurrentSequenceType(sequenceType);
  createQueryRequest();
  // @TODO implement advanced cache with max memory usage limit
  const execute = useCache
    ? memoize<RunsSearchQueryParams, Promise<unknown>>(executeBaseQuery)
    : executeBaseQuery;

  return {
    execute,
    cancel,
  };
}

export default createQuery;
