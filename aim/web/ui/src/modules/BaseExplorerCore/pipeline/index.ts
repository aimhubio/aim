import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createGrouping, { Grouping } from './grouping';
import createQuery, { Query } from './query';
import createAdapter, { Adapter } from './adapter';
// @ts-ignore
import { BettaGroupOption } from './grouping/types';

export type PipelineOptions = {
  sequenceName: SequenceTypesEnum;
  callbacks: {
    statusChangeCallback?: (status: string) => void;
    exceptionCallback?: () => void;
    // warningCallback?: () => void;
    resultCallback?: () => void;
  };
  adapter: {
    objectDepth: AimObjectDepths;
    useCache?: boolean;
  };
  query: {
    getLatestResult?: () => void;
    useCache?: boolean;
  };
  grouping: {
    getLatestResult?: () => void;
    useCache?: boolean;
  };
};

export type PipelineExecutionOptions = {
  query?: {
    // forceRun?: boolean;
    params: RunsSearchQueryParams;
  };
  group?: BettaGroupOption[];
};

export type Pipeline = {
  execute: (options: PipelineExecutionOptions) => Promise<any>;
};

let phases: {
  query?: Query;
  adapter?: Adapter;
  grouping?: Grouping;
} = {};

let callbacks: {
  statusChangeCallback?: (status: string) => void;
  exceptionCallback?: () => void;
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
  );
}

function createGroupingInstance(config: any = {}) {
  phases.grouping = createGrouping({
    ...config,
    statusChangeCallback: callbacks.statusChangeCallback,
  });
}

async function execute(options: PipelineExecutionOptions): Promise<any> {
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

  return {
    data: groupingResult.objectList,
    foundGroups: groupingResult.foundGroups,
    appliedGroupsConfig: groupingResult.appliedGroupsConfig,
    additionalData: adapterResult.additionalData,
    queryableData: adapterResult.queryable_data,
  };
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
  setCallbacks(callbacks);
  createQueryInstance({ query, sequenceName });
  createAdapterInstance({ ...adapter, sequenceName });
  createGroupingInstance({ ...grouping, useCache: false });

  return {
    execute,
  };
}

export default createPipeline;
