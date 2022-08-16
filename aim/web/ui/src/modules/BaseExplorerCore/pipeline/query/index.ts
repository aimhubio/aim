// @TODO implement live update in this file
// @TODO complete docs, comments
// @TODO complete typings

import {
  createSearchRunsRequest,
  RunsSearchQueryParams,
} from 'services/api/base-explorer/runsApi';
import { RequestInstance } from 'services/NetworkService';

import { RunSearchRunView } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';

import createInlineCache, { InlineCache } from '../../cache/inlineCache';

export type Query = {
  execute: (
    query: RunsSearchQueryParams,
    ignoreCache: boolean,
  ) => Promise<RunSearchRunView[]>;
  cancel: () => void;
};

let currentQueryRequest: RequestInstance;
let currentSequenceType: SequenceTypesEnum;
let statusChangeCallback: ((status: string) => void) | undefined;
let cache: InlineCache | null = null;

async function executeBaseQuery(
  query: RunsSearchQueryParams,
  ignoreCache: boolean = false,
): Promise<RunSearchRunView[]> {
  if (cache && !ignoreCache) {
    const cachedResult = cache.get(query);
    if (cachedResult) {
      return cachedResult;
    }
  }
  cancel();
  statusChangeCallback && statusChangeCallback('fetching'); // make invariant with type mapping
  try {
    const data: ReadableStream = await currentQueryRequest.call(query);
    statusChangeCallback && statusChangeCallback('decoding');

    const result = parseStream<Array<RunSearchRunView>>(data);
    if (cache) {
      cache.set(query, result);
    }

    return result;
  } catch (e) {
    console.log(e);
    return [];
  }
}

function setCurrentSequenceType(sequenceType: SequenceTypesEnum): void {
  currentSequenceType = sequenceType;
}

function setStatusChangeCallback(callback?: (status: string) => void) {
  statusChangeCallback = callback;
}

function createQueryRequest(): void {
  currentQueryRequest = createSearchRunsRequest(currentSequenceType);
}

/**
 * function cancel
 * This function is useful to abort api request
 */
function cancel(): void {
  if (currentQueryRequest) {
    currentQueryRequest.cancel();
    createQueryRequest();
  }
}

/**
 *
 * @param {SequenceTypesEnum} sequenceType - sequence name
 * @param {Boolean} useCache - boolean value to indicate query need to be  cached or not
 * @param statusChangeCallback
 */
function createQuery(
  sequenceType: SequenceTypesEnum,
  useCache: boolean = false,
  statusChangeCallback?: (status: string) => void,
): Query {
  setCurrentSequenceType(sequenceType);
  setStatusChangeCallback(statusChangeCallback);
  createQueryRequest();
  cache = useCache ? createInlineCache() : null;

  // do not delete yet, maybe there are some use cases where we need to cancel the request
  // const execute = useCache
  //   ? memoize<RunsSearchQueryParams, Promise<RunSearchRunView[]>>(
  //       executeBaseQuery,
  //     )
  //   : executeBaseQuery;

  const execute = executeBaseQuery;

  return {
    execute,
    cancel,
  };
}

export default createQuery;
