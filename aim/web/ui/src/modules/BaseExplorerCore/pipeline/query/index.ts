// @TODO implement live update in this file
// @TODO complete docs, comments
// @TODO complete typings

import { memoize } from 'modules/BaseExplorerCore/cache';

import {
  createSearchRunsRequest,
  RunsSearchQueryParams,
} from 'services/api/base-explorer/runsApi';
import { RequestInstance } from 'services/NetworkService';

import { RunSearchRunView } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';

export type Query = {
  execute: (params: RunsSearchQueryParams) => Promise<RunSearchRunView[]>;
  cancel: () => void;
};

let currentQueryRequest: RequestInstance;
let currentSequenceType: SequenceTypesEnum;
let statusChangeCallback: ((status: string) => void) | undefined;

async function executeBaseQuery(
  query: RunsSearchQueryParams,
): Promise<RunSearchRunView[]> {
  cancel();
  statusChangeCallback && statusChangeCallback('fetching'); // make invariant with type mapping

  const data: ReadableStream = await currentQueryRequest.call(query);

  statusChangeCallback && statusChangeCallback('decoding');

  return parseStream<Array<RunSearchRunView>>(data);
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
  // @TODO implement advanced cache with max memory usage limit
  const execute = useCache
    ? memoize<RunsSearchQueryParams, Promise<RunSearchRunView[]>>(
        executeBaseQuery,
      )
    : executeBaseQuery;

  return {
    execute,
    cancel,
  };
}

export default createQuery;
