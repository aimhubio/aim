import { StoreApi, UseBoundStore } from 'zustand';
import createReact from 'zustand';

import createVanilla from 'zustand/vanilla';
import { PipelineOptions } from 'modules/core/pipeline';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import createPipelineEngine, { IPipelineEngine } from './pipeline';
import createInstructionsEngine, { IInstructionsEngine } from './instructions';
import { IEngineConfigFinal } from './types';

type State = {
  pipeline?: any;
  instructions?: any;
};

type Engine<TStore, TObject, SequenceName extends SequenceTypesEnum> = {
  pipeline?: IPipelineEngine<TObject, TStore>['engine'];
  instructions?: IInstructionsEngine<TStore, SequenceName>['engine'];

  useStore?: UseBoundStore<StoreApi<TStore>>;
  subscribeToStore?: (listener: (state: TStore) => void) => void;
};

function getPipelineEngine(
  config: IEngineConfigFinal,
  set: any,
  get: any,
  state: State, // mutable
) {
  const pipelineOptions: Omit<PipelineOptions, 'callbacks'> = {
    sequenceName: config.sequenceName,
    adapter: {
      objectDepth: config.adapter.objectDepth,
      useCache: config.useCache,
    },
    grouping: {
      useCache: config.useCache,
    },
    query: {
      useCache: config.useCache,
    },
  };
  const pipeline = createPipelineEngine<object, AimFlatObjectBase<any>>(
    { setState: set, getState: get },
    pipelineOptions,
  );
  state['pipeline'] = pipeline.state;

  return pipeline.engine;
}

function getInstructionEngine(
  config: IEngineConfigFinal,
  set: any,
  get: any,
  state: State, // mutable,
) {
  const instructions = createInstructionsEngine<object>(
    { setState: set, getState: get },
    { sequenceName: config.sequenceName },
  );

  state['instructions'] = instructions.state;

  return instructions.engine;
}

function createEngine(
  config: IEngineConfigFinal,
): Engine<object, AimFlatObjectBase<any>, typeof config.sequenceName> {
  let engine: Engine<
    object,
    AimFlatObjectBase<any>,
    typeof config.sequenceName
  > = {};
  // @ts-ignore
  const store = createVanilla<StoreApi<object>>((set, get) => {
    const state = {};

    /**
     * Instructions
     */
    engine.instructions = getInstructionEngine(config, set, get, state);

    /**
     * Pipeline
     */
    engine.pipeline = getPipelineEngine(config, set, get, state);

    return state;
  });

  engine.useStore = createReact<StoreApi<object>>(store);
  engine.subscribeToStore = engine.useStore.subscribe;

  return engine;
}

export default createEngine;
