// @TODO implement live update in this file

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
let statusCallback: (status: string) => void;

async function executeBaseQuery(
  query: RunsSearchQueryParams,
): Promise<RunSearchRunView[]> {
  cancel();
  statusCallback && statusCallback('fetching'); // make invariant with type mapping

  const data: ReadableStream = await currentQueryRequest.call(query);

  statusCallback && statusCallback('decoding');

  return parseStream<Array<RunSearchRunView>>(data);
}

function setCurrentSequenceType(sequenceType: SequenceTypesEnum): void {
  currentSequenceType = sequenceType;
}

function setStatusCallback(callback: (status: string) => void) {
  statusCallback = callback;
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
 * @param statusCallback
 */
function createQuery(
  sequenceType: SequenceTypesEnum,
  useCache: boolean = false,
  statusCallback: (status: string) => void,
): Query {
  setCurrentSequenceType(sequenceType);
  setStatusCallback(statusCallback);

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
