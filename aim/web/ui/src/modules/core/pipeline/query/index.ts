// @TODO implement live update in this file
// @TODO complete docs, comments
// @TODO complete typings

import createInlineCache, { InlineCache } from 'modules/core/cache/inlineCache';
import {
  createSearchRunsRequest,
  RunsSearchQueryParams,
} from 'modules/core/api/runsApi';

import { RequestInstance } from 'services/NetworkService';

import { RunSearchRunView } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import { parseStream } from 'utils/encoder/streamEncoding';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';

import { Query, RequestProgressCallback } from './types';

type QueryInternalConfig = {
  cache?: InlineCache;
  currentQueryRequest?: RequestInstance;
  currentSequenceType?: SequenceTypesEnum;
  statusChangeCallback?: StatusChangeCallback;
  requestProgressCallback?: RequestProgressCallback;
};

const config: QueryInternalConfig = {};

async function executeBaseQuery(
  query: RunsSearchQueryParams,
  ignoreCache: boolean = false,
): Promise<RunSearchRunView[]> {
  if (config.cache && !ignoreCache) {
    const cachedResult = config.cache.get(query);
    if (cachedResult) {
      return cachedResult;
    }
  }
  cancel();

  if (config.statusChangeCallback) {
    config.statusChangeCallback(PipelinePhasesEnum.Fetching); // make invariant with type mapping
  }

  try {
    const data: ReadableStream = (await config.currentQueryRequest?.call(
      query,
    )) as ReadableStream; // @TODO write better code to avoid null check

    if (config.statusChangeCallback) {
      config.statusChangeCallback(PipelinePhasesEnum.Decoding);
    }

    const progressCallback: RequestProgressCallback | undefined =
      query.report_progress ? config.requestProgressCallback : undefined;

    const result = parseStream<Array<RunSearchRunView>>(data, progressCallback);
    if (config.cache) {
      config.cache.set(query, result);
    }

    return result;
  } catch (e) {
    // if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error("Can't query runs ---> ", e);
    throw e;
    // }
    // return [];
  }
}

function setCurrentSequenceType(sequenceType: SequenceTypesEnum): void {
  config.currentSequenceType = sequenceType;
}

function setStatusChangeCallback(callback?: (status: string) => void) {
  config.statusChangeCallback = callback;
}

function createQueryRequest(): void {
  config.currentQueryRequest = createSearchRunsRequest(
    config?.currentSequenceType || SequenceTypesEnum.Images, // @TODO write better typing to avoid using default values
  );
}

function setRequestProgressCallback(callback?: RequestProgressCallback): void {
  config.requestProgressCallback = callback;
}

/**
 * function cancel
 * This function is useful to abort api request
 */
function cancel(): void {
  if (config.currentQueryRequest) {
    config.currentQueryRequest.cancel();
    createQueryRequest();
  }
}

/**
 *
 * @param {SequenceTypesEnum} sequenceType - sequence name
 * @param {Boolean} useCache - boolean value to indicate query need to be  cached or not
 * @param statusChangeCallback - sends status change to callee
 * @param requestProgressCallback
 */
function createQuery(
  sequenceType: SequenceTypesEnum,
  useCache: boolean = false,
  statusChangeCallback?: (status: string) => void,
  requestProgressCallback?: RequestProgressCallback,
): Query {
  setCurrentSequenceType(sequenceType);
  setStatusChangeCallback(statusChangeCallback);
  setStatusChangeCallback(statusChangeCallback);
  setRequestProgressCallback(requestProgressCallback);

  createQueryRequest();

  if (useCache) {
    config.cache = createInlineCache();
  }

  const execute = executeBaseQuery;

  const clearCache = () => {
    if (config.cache) {
      config.cache.clear();
    }
  };

  return {
    clearCache,
    execute,
    cancel,
  };
}

export * from './types';
export default createQuery;
