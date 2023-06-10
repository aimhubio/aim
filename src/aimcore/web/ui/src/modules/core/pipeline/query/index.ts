// @TODO implement live update in this file
// @TODO complete docs, comments
// @TODO complete typings

import createInlineCache, { InlineCache } from 'modules/core/cache/inlineCache';
import { createFetchGroupedSequencesRequest } from 'modules/core/api/dataFetchApi';

import { RequestInstance } from 'services/NetworkService';

import { ContainerType, SequenceType } from 'types/core/enums';
import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import { parseStream } from 'utils/encoder/streamEncoding';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';
import { GroupedSequencesSearchQueryParams } from '../../api/dataFetchApi/types';

import { Query, RequestProgressCallback } from './types';
import { DecodingError, FetchingError } from './QueryError';

type QueryInternalConfig = {
  cache?: InlineCache;
  currentQueryRequest?: RequestInstance;
  currentSequenceType?: SequenceType;
  statusChangeCallback?: StatusChangeCallback;
  requestProgressCallback?: RequestProgressCallback;
};

/**
 *
 * @param {SequenceType} sequenceType - sequence name
 * @param {Boolean} useCache - boolean value to indicate query need to be  cached or not
 * @param statusChangeCallback - sends status change to callee
 * @param requestProgressCallback
 */
function createQuery(
  sequenceType: SequenceType,
  useCache: boolean = false,
  statusChangeCallback?: StatusChangeCallback,
  requestProgressCallback?: RequestProgressCallback,
): Query {
  const config: QueryInternalConfig = {};

  async function executeBaseQuery(
    query: GroupedSequencesSearchQueryParams,
    ignoreCache: boolean = false,
  ): Promise<Array<GroupedSequence>> {
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
    let data: ReadableStream;
    try {
      data = (await config.currentQueryRequest?.call(query)) as ReadableStream; // @TODO write better code to avoid null check
    } catch (e) {
      throw new FetchingError(e.message || e, e.detail).getError();
    }

    if (config.statusChangeCallback) {
      config.statusChangeCallback(PipelinePhasesEnum.Decoding);
    }

    const progressCallback: RequestProgressCallback | undefined =
      query.report_progress ? config.requestProgressCallback : undefined;
    try {
      const result = parseStream<Array<GroupedSequence>>(data, {
        progressCallback,
      });
      if (config.cache) {
        config.cache.set(query, result);
      }
      return result;
    } catch (e) {
      throw new DecodingError(e.message || e, e.detail).getError();
    }
  }

  function setCurrentSequenceType(sequenceType: SequenceType): void {
    config.currentSequenceType = sequenceType;
  }

  function setStatusChangeCallback(callback?: StatusChangeCallback) {
    config.statusChangeCallback = callback;
  }

  function createQueryRequest(): void {
    config.currentQueryRequest = createFetchGroupedSequencesRequest(
      config.currentSequenceType!,
      ContainerType.Run, // @TODO add container type to config
    );
  }

  function setRequestProgressCallback(
    callback?: RequestProgressCallback,
  ): void {
    config.requestProgressCallback = callback;
  }

  /**
   * function cancel
   * This function is useful to abort api request
   */
  function cancel(): void {
    if (config.currentQueryRequest) {
      config.currentQueryRequest.cancel();
    }
    createQueryRequest();
  }

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
