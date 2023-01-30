import { memoize } from 'modules/core/cache';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';
import { RequestProgressCallback } from '../query';
import { DecodingError, FetchingError } from '../query/QueryError';
import { parseStream } from '../../../../utils/encoder/streamEncoding';
import createInlineCache, { InlineCache } from '../../cache/inlineCache';
import { RequestInstance } from '../../../../services/NetworkService';
import AimError from '../../AimError';
import { buildObjectHash } from '../../utils/hashing';
import { RunsSearchQueryParams } from '../../api/runsApi';
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
    params: RunsSearchQueryParams;
  },
  ignoreCache: boolean = false,
): Promise<any> {
  if (config.cache && !ignoreCache) {
    const queryHash = buildObjectHash(query);
    const cachedResult = config.cache.get(queryHash);
    if (cachedResult) {
      return cachedResult;
    }
  }
  cancel();

  if (config.statusChangeCallback) {
    config.statusChangeCallback(PipelinePhasesEnum.Fetching);
  }
  let data: ReadableStream;
  try {
    data = (await config.currentRequest?.call(query)) as ReadableStream;
  } catch (e) {
    throw new FetchingError(e.message || e, e.detail).getError();
  }

  if (config.statusChangeCallback) {
    config.statusChangeCallback(PipelinePhasesEnum.Decoding);
  }
  const progressCallback = query.params.report_progress
    ? config.requestProgressCallback
    : undefined;
  try {
    const result = parseStream(data, { progressCallback });
    if (config.cache) {
      const queryHash = buildObjectHash(query);
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
    const queryResult = await executeQuery(
      {
        body: options.body,
        params: options.params,
      },
      options.ignoreCache,
    );
    const processedResult = options.processData(currentResult, queryResult);
    return Promise.resolve(processedResult);
  } catch (e) {
    throw new AimError(e.message || e, e.detail);
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

  const clearCache = () => {
    if (config.cache) {
      config.cache.clear();
    }
  };

  const execute = useCache
    ? memoize<CustomPhaseExecutionOptions, Promise<ProcessedData>>(
        executeCustomPhase,
      )
    : executeCustomPhase;
  return {
    execute,
    clearCache,
  };
}

export default createCustomPhase;
