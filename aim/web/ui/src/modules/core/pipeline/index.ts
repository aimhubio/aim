import { RunsSearchQueryParams } from 'modules/core/api/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createGrouping, { Grouping } from './grouping';
import createQuery, { Query, RequestProgressCallback } from './query';
import createAdapter, { Adapter } from './adapter';
// @ts-ignore
import { BettaGroupOption } from './grouping/types';
import { PipelinePhasesEnum, StatusChangeCallback } from './types';

export type PipelineOptions = {
  sequenceName: SequenceTypesEnum;
  callbacks: {
    statusChangeCallback?: StatusChangeCallback;
    exceptionCallback?: () => void;
    requestProgressCallback?: RequestProgressCallback;
    // warningCallback?: () => void;
    resultCallback?: () => void;
  };
  adapter: {
    objectDepth: AimObjectDepths;
    useCache?: boolean;
  };
  query: {
    useCache?: boolean;
  };
  grouping: {
    getLatestResult?: () => void;
    useCache?: boolean;
  };
};

export type PipelineExecutionOptions = {
  query?: {
    params: RunsSearchQueryParams;
    ignoreCache?: boolean;
  };
  group?: BettaGroupOption[];
};

export type Pipeline = {
  execute: (options: PipelineExecutionOptions) => Promise<any>;
  clearCache: () => void;
};

let phases: {
  query?: Query;
  adapter?: Adapter;
  grouping?: Grouping;
} = {};

let callbacks: {
  statusChangeCallback?: (status: string) => void;
  exceptionCallback?: () => void;
  requestProgressCallback?: RequestProgressCallback;
};

function setCallbacks(cbs: any) {
  callbacks = cbs;
}

function createAdapterInstance(config: any) {
  phases.adapter = createAdapter({
    ...config,
    statusChangeCallback: callbacks.statusChangeCallback,
  });
}

function createQueryInstance(config: any) {
  phases.query = createQuery(
    config.sequenceName,
    config.query.useCache,
    callbacks.statusChangeCallback,
    callbacks.requestProgressCallback,
  );
}

function createGroupingInstance(config: any = {}) {
  phases.grouping = createGrouping({
    ...config,
    statusChangeCallback: callbacks.statusChangeCallback,
  });
}

async function execute(options: PipelineExecutionOptions): Promise<any> {
  // @TODO make cancelable, use thenable instead of await
  try {
    // @ts-ignore
    const queryResult = await phases.query.execute(options.query.params);
    // @ts-ignore
    const adapterResult = await phases.adapter.execute(queryResult);
    // @ts-ignore
    const groupingResult = phases.grouping.execute({
      objectList: adapterResult.objectList,
      // @ts-ignore
      grouping: options.group,
    });
    callbacks.statusChangeCallback &&
      callbacks.statusChangeCallback(PipelinePhasesEnum.Waiting);
    return {
      data: groupingResult.objectList,
      foundGroups: groupingResult.foundGroups,
      appliedGroupsConfig: groupingResult.appliedGroupsConfig,
      additionalData: adapterResult.additionalData,
      queryableData: adapterResult.queryable_data,
    };
  } catch (e) {
    callbacks.statusChangeCallback &&
      callbacks.statusChangeCallback(PipelinePhasesEnum.Waiting);
    throw e;
  }
}

/**
 *
 * @param {SequenceTypesEnum} sequenceName
 * @param query
 * @param adapter
 * @param grouping
 * @param callbacks
 */
function createPipeline({
  sequenceName,
  query,
  adapter,
  grouping,
  callbacks,
}: PipelineOptions): Pipeline {
  // request progress callback is not included since it is not used in the pipeline
  setCallbacks(callbacks);
  createQueryInstance({ query, sequenceName });
  createAdapterInstance({ ...adapter, sequenceName });
  createGroupingInstance({ ...grouping, useCache: false });

  return {
    execute,
    clearCache: () => {
      phases.query?.clearCache();
      // Add clear cache for grouping
      // Add clear cache for adapter
    },
  };
}

export * from './query/types';
export * from './adapter/types';
export * from './types';
export default createPipeline;
