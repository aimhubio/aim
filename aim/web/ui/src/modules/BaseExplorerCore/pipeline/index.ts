import { RunsSearchQueryParams } from 'services/api/base-explorer/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import createModifier, { Modifier } from './modifier';
import createQuery, { Query } from './query';
import createAdapter, { Adapter } from './adapter';

export type PipelineOptions = {
  sequenceName: SequenceTypesEnum;
  callbacks: {
    statusChangeCallback?: () => void;
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
  modifier: {
    getLatestResult?: () => void;
    useCache?: boolean;
  };
};

export type PipelineExecutionOptions = {
  query?: {
    // forceRun?: boolean;
    params: RunsSearchQueryParams;
  };
  modify?: {
    group: {};
    order: {};
  };
};

export type Pipeline = {
  execute: (options: PipelineExecutionOptions) => Promise<any>;
};

let phases: {
  query?: Query;
  adapter?: Adapter;
  modifier?: Modifier;
} = {};

function createAdapterInstance(config: any) {
  phases.adapter = createAdapter(config);
}

function createQueryInstance(config: any) {
  phases.query = createQuery(
    config.sequenceName,
    config.query.useCache,
    () => {},
  );
}

function createModifierInstance(config: any = {}) {
  phases.modifier = createModifier(config);
}

async function execute(options: PipelineExecutionOptions): Promise<any> {
  // @ts-ignore
  const queryResult = await phases.query.execute(options.query.params);

  // @ts-ignore
  const adapterResult = await phases.adapter.execute(queryResult);
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

/**
 *
 * @param {SequenceTypesEnum} sequenceName
 * @param query
 * @param adapter
 * @param modifier
 */
function createPipeline({
  sequenceName,
  query,
  adapter,
  modifier,
}: PipelineOptions): Pipeline {
  createQueryInstance({ query, sequenceName });
  createAdapterInstance({ ...adapter, sequenceName });
  createModifierInstance(modifier);

  return {
    execute,
  };
}

export default createPipeline;
