import { RunsSearchQueryParams } from 'modules/core/api/runsApi';
import { buildObjectHash } from 'modules/core/utils/hashing';
import createInlineCache, { InlineCache } from 'modules/core/cache/inlineCache';
import {
  DecodingError,
  FetchingError,
} from 'modules/core/pipeline/query/QueryError';
import AimError from 'modules/core/AimError';

import { RequestInstance } from 'services/NetworkService';

import { parseStream } from 'utils/encoder/streamEncoding';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';
import { RequestProgressCallback } from '../query';
import { CustomPhaseExecutionArgs, ProcessedData } from '../index';

export type CustomPhaseConfigOptions = {
  useCache?: boolean;
  statusChangeCallback?: StatusChangeCallback;
  requestProgressCallback?: RequestProgressCallback;
};

export type CustomPhase = {
  execute: (params: CustomPhaseExecutionOptions) => Promise<ProcessedData>;
  clearCache: () => void;
};

export interface CustomPhaseExecutionOptions {
  currentResult: ProcessedData;
  options?: CustomPhaseExecutionArgs | null;
}

// later usage in modification
let config: {
  cache?: InlineCache;
  currentRequest?: RequestInstance;
  createRequest?: () => RequestInstance;
  useCache: boolean;
  statusChangeCallback?: StatusChangeCallback;
  requestProgressCallback?: RequestProgressCallback;
};

function createRequest(create?: () => RequestInstance): void {
  if (typeof create === 'function') {
    config.createRequest = create;
  }

  config.currentRequest =
    typeof config.createRequest === 'function'
      ? config.createRequest()
      : undefined;
}

function setCustomPhaseConfig(options: CustomPhaseConfigOptions): void {
  config = {
    useCache: !!options.useCache,
    statusChangeCallback: options.statusChangeCallback,
    requestProgressCallback: options.requestProgressCallback,
  };

  if (options.useCache) {
    config.cache = createInlineCache();
  }
}

/**
 * function cancel
 * This function is useful to abort api request
 */
function cancel(): void {
  if (config.currentRequest) {
    config.currentRequest.cancel();
  }
  createRequest();
}

async function executeQuery(
  query: {
    body?: {};
    params?: RunsSearchQueryParams;
  },
  ignoreCache: boolean = false,
  queryHash: string,
): Promise<any> {
  if (config.cache && !ignoreCache) {
    const cachedResult = config.cache.get(queryHash);
    if (cachedResult) {
      return cachedResult;
    }
  }
  cancel();

  if (!config.currentRequest) {
    return Promise.resolve([]);
  }
  if (config.statusChangeCallback) {
    config.statusChangeCallback(PipelinePhasesEnum.Fetching);
  }
  let data: ReadableStream;
  try {
    data = (await config.currentRequest.call(query)) as ReadableStream;
  } catch (e) {
    throw new FetchingError(e.message || e, e.detail).getError();
  }

  if (config.statusChangeCallback) {
    config.statusChangeCallback(PipelinePhasesEnum.Decoding);
  }
  const progressCallback = query.params?.report_progress
    ? config.requestProgressCallback
    : undefined;
  try {
    const result = parseStream(data, { progressCallback });
    if (config.cache) {
      config.cache.set(queryHash, result);
    }
    return result;
  } catch (e) {
    throw new DecodingError(e.message || e, e.detail).getError();
  }
}

export async function executeCustomPhase({
  currentResult,
  options,
}: CustomPhaseExecutionOptions): Promise<ProcessedData> {
  if (!options) {
    return Promise.resolve(currentResult);
  }

  createRequest(options.createRequest);

  try {
    const query = {
      body: options.body,
      params: options.params,
    };
    const queryHash = buildObjectHash(query);
    const queryResult = await executeQuery(
      query,
      options.ignoreCache,
      queryHash,
    );
    const processedResult = options.processData(
      currentResult,
      queryResult,
      () => {
        config.cache?.delete(queryHash);
      },
    );
    return Promise.resolve(processedResult);
  } catch (e) {
    throw new AimError(e.message || e, e.detail).getError();
  }
}

function clearCache() {
  if (config.cache) {
    config.cache.clear();
  }
}

function createCustomPhase({
  useCache = false,
  statusChangeCallback,
  requestProgressCallback,
}: CustomPhaseConfigOptions): CustomPhase {
  setCustomPhaseConfig({
    useCache,
    statusChangeCallback,
    requestProgressCallback,
  });

  return {
    execute: executeCustomPhase,
    clearCache,
  };
}

export default createCustomPhase;
