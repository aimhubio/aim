import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createModifier, { Modifier } from './modifier';
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
  modifier: {
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
  modifier?: Modifier;
} = {};

function makeAdapter(config: any) {
  phases.adapter = createAdapter(config);
}

function makeQuery(config: any) {
  phases.query = createQuery(config.sequenceName, config.query.useCache);
}

function makeModifier(config: any = {}) {
  phases.modifier = createModifier(config);
}

async function execute(options: PipelineExecutionOptions): Promise<any> {
  // @ts-ignore
  const queryResult = await phases.query.execute(options.query.params);

  // @ts-ignore
  const adapterResult = phases.adapter.execute(queryResult);
  // @ts-ignore
  const modifierResult = phases.modifier.execute({
    objectList: adapterResult.objectList,
    // @ts-ignore
    modifiers: ['run.hparams.batch_size', 'run.experiment', 'images.name'],
  });

  return {
    data: modifierResult.data,
    additionalData: adapterResult.additionalData,
    modifierConfig: modifierResult.modifierConfig,
  };
}

function createPipeline({
  sequenceName,
  query,
  adapter,
  modifier,
}: PipelineOptions): Pipeline {
  makeQuery({ query, sequenceName });
  makeAdapter({ ...adapter, sequenceName });
  makeModifier(modifier);

  return {
    execute,
  };
}

export default createPipeline;
