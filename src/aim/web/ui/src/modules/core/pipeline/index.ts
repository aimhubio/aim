import { RunsSearchQueryParams } from 'modules/core/api/runsApi';

import { RequestInstance } from 'services/NetworkService';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createGrouping, { Grouping } from './grouping';
import createQuery, { Query, RequestProgressCallback } from './query';
import createAdapter, { Adapter } from './adapter';
import createCustomPhase, { CustomPhase } from './custom';
// @ts-ignore
import { BettaGroupOption } from './grouping/types';
import { PipelinePhasesEnum, StatusChangeCallback } from './types';
import PipelineError from './PipelineError';
import { IQueryableData, ProcessedData } from './adapter/types';

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
  custom: {
    useCache?: boolean;
  };
  persist?: boolean; // Later use
};

export type PipelineExecutionOptions = {
  query: {
    params: RunsSearchQueryParams;
    ignoreCache?: boolean;
  };
  group: BettaGroupOption[];
  custom: CustomPhaseExecutionArgs | null;
};

export type CustomPhaseExecutionArgs = {
  createRequest?: () => RequestInstance;
  params?: RunsSearchQueryParams;
  body?: {};
  processData: (
    currentResult: ProcessedData,
    queryResult: any,
    clearCache: () => void,
  ) => ProcessedData;
  ignoreCache?: boolean;
};

export type Pipeline = {
  execute: (options: PipelineExecutionOptions) => Promise<any>;
  clearCache: () => void;
};

export type PipelineResult = {
  data: any[];
  foundGroups: any;
  appliedGroupsConfig: any;
  additionalData: {
    params: string[];
    sequenceInfo: string[];
    modifiers: string[];
  };
  queryableData: IQueryableData;
};

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
  custom,
  callbacks,
}: PipelineOptions): Pipeline {
  let phases: {
    query?: Query;
    adapter?: Adapter;
    grouping?: Grouping;
    custom?: CustomPhase;
  } = {};

  let _callbacks: {
    statusChangeCallback?: (status: string) => void;
    exceptionCallback?: () => void;
    requestProgressCallback?: RequestProgressCallback;
  };

  function setCallbacks(cbs: any) {
    _callbacks = cbs;
  }

  function createAdapterInstance(config: any) {
    phases.adapter = createAdapter({
      ...config,
      statusChangeCallback: _callbacks.statusChangeCallback,
    });
  }

  function createQueryInstance(config: any) {
    phases.query = createQuery(
      config.sequenceName,
      config.query.useCache,
      _callbacks.statusChangeCallback,
      _callbacks.requestProgressCallback,
    );
  }

  function createGroupingInstance(config: any = {}) {
    phases.grouping = createGrouping({
      ...config,
      statusChangeCallback: _callbacks.statusChangeCallback,
    });
  }

  function createCustomPhaseInstance(config: any = {}) {
    phases.custom = createCustomPhase({
      useCache: !!config.useCache,
      statusChangeCallback: _callbacks.statusChangeCallback,
      requestProgressCallback: _callbacks.requestProgressCallback,
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
      const customResult = await phases.custom.execute({
        currentResult: adapterResult,
        options: options.custom,
      });
      // @ts-ignore
      const groupingResult = phases.grouping.execute({
        ...customResult,
        // @ts-ignore
        grouping: options.group,
      });

      let result: PipelineResult = {
        data: groupingResult.objectList,
        foundGroups: groupingResult.foundGroups,
        appliedGroupsConfig: groupingResult.appliedGroupsConfig,
        additionalData: customResult.additionalData,
        queryableData: customResult.queryable_data,
      };

      // @ts-ignore
      _callbacks.statusChangeCallback &&
        _callbacks.statusChangeCallback(PipelinePhasesEnum.Waiting);
      return result;
    } catch (e) {
      _callbacks.statusChangeCallback &&
        _callbacks.statusChangeCallback(PipelinePhasesEnum.Waiting);
      throw new PipelineError(e.message || e, e.detail, e.source).getError();
    }
  }

  // request progress callback is not included since it is not used in the pipeline
  setCallbacks(callbacks);
  createQueryInstance({ query, sequenceName });
  createAdapterInstance({ ...adapter, sequenceName });
  createCustomPhaseInstance({ ...custom });
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
