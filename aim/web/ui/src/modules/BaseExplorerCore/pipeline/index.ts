import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { RunSearchRunView } from '../../../types/core/AimObjects';

import createQuery, { Query } from './query';
import createAdapter, { Adapter } from './adapter';

type PipelineOptions = {
  sequenceName: SequenceTypesEnum;
  adapter: {
    objectDepth: AimObjectDepths;
    useCache?: boolean;
  };
  query: {
    useCache?: boolean;
  };
};

type PipelineExecutionOptions = {
  query?: {
    // forceRun?: boolean;
    params: RunsSearchQueryParams;
  };
  modify?: {
    group: {};
    order: {};
  };
};

type Pipeline = {
  execute: (options: PipelineExecutionOptions) => Promise<any>;
};

let phases: {
  query?: Query;
  adapter?: Adapter;
} = {};

function makeAdapter(config: any) {
  phases.adapter = createAdapter(config);
}

function makeQuery(config: any) {
  phases.query = createQuery(config.sequenceName, config.query.useCache);
}

async function execute(options: PipelineExecutionOptions): Promise<any> {
  // @ts-ignore
  const queryResult = await phases.query.execute(options.query.params);
  console.log('query-result : ', queryResult);
  const adapterResult = phases.adapter?.execute(queryResult);
  console.log('adapter-result : ', adapterResult);
  return adapterResult;
}

function createPipeline({
  sequenceName,
  query,
  adapter,
}: PipelineOptions): Pipeline {
  makeQuery({ query, sequenceName });
  makeAdapter({ ...adapter, sequenceName });
  return {
    execute,
  };
}

export default createPipeline;
