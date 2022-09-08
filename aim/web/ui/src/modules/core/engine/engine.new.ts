import createReact, { StoreApi, UseBoundStore } from 'zustand';

import createVanilla from 'zustand/vanilla';
import { PipelineOptions } from 'modules/core/pipeline';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import { ExplorerEngineConfiguration } from '../../BaseExplorerNew/types';

import createPipelineEngine, { IPipelineEngine } from './pipeline';
import createInstructionsEngine, { IInstructionsEngine } from './instructions';
import { IEngineConfigFinal, PipelineStatusEnum } from './types';
import createExplorerEngine from './explorer';
import createVisualizationsEngine, {
  VisualizationsConfig,
} from './visualizations';

type State = {
  pipeline?: any;
  instructions?: any;
  explorer?: any;
  visualizations?: any;
};

export type EngineNew<
  TStore,
  TObject,
  SequenceName extends SequenceTypesEnum,
> = {
  // sub engines
  pipeline: IPipelineEngine<TObject, TStore>['engine'];
  instructions: IInstructionsEngine<TStore, SequenceName>['engine'];
  visualizations: any;

  // methods
  initialize: () => void;
  finalize: () => void;

  // store helpers
  useStore: UseBoundStore<StoreApi<TStore>>;
  subscribeToStore: (listener: (state: TStore) => void) => void;
};

function getPipelineEngine(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  state: State, // mutable
) {
  const useCache = config.enablePipelineCache;

  const pipelineOptions: Omit<PipelineOptions, 'callbacks'> = {
    sequenceName: config.sequenceName,
    adapter: {
      objectDepth: config.adapter.objectDepth,
      useCache,
    },
    grouping: {
      useCache,
    },
    query: {
      useCache,
    },
  };
  const pipeline = createPipelineEngine<object, AimFlatObjectBase<any>>(
    { setState: set, getState: get },
    pipelineOptions,
  );
  state['pipeline'] = pipeline.state.pipeline;

  return pipeline.engine;
}

function getInstructionsEngine(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  state: State, // mutable,
) {
  const instructions = createInstructionsEngine<object>(
    { setState: set, getState: get },
    { sequenceName: config.sequenceName },
  );

  state['instructions'] = instructions.state.instructions;

  return instructions.engine;
}

function getExplorerEngine(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  state: State, // mutable
) {
  // const explorer = createExplorerEngine<object>(config, {
  //   setState: set,
  //   getState: set,
  // });
  // state['explorer'] = explorer.state.explorer;
  // return explorer.engine;
}

function getVisualizationsEngine(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  state: State,
) {
  const visualizations = createVisualizationsEngine<State>(
    config.visualizations,
    {
      setState: set,
      getState: get,
    },
  );

  state['visualizations'] = visualizations.state.visualizations;

  console.log('entier state ----> ');

  return visualizations.engine;
}

function createEngine<TObject = any>(
  config: ExplorerEngineConfiguration,
  name: string = 'baseEngine',
): EngineNew<object, AimFlatObjectBase<TObject>, typeof config.sequenceName> {
  let pipeline: IPipelineEngine<AimFlatObjectBase<TObject>, object>['engine'];
  let instructions: IInstructionsEngine<
    object,
    typeof config.sequenceName
  >['engine'];

  let visualizations: any;

  // @ts-ignore
  const store = createVanilla<StoreApi<object>>((set, get) => {
    const state = {};

    /**
     * Instructions
     */
    instructions = getInstructionsEngine(config, set, get, state);

    /**
     * Pipeline
     */
    pipeline = getPipelineEngine(config, set, get, state);

    /**
     * Explorer
     */

    /**
     * Visualizations
     */
    visualizations = getVisualizationsEngine(config, set, get, state);

    /**
     * Custom states
     */
    return state;
  });

  // @ts-ignore
  function initialize() {
    // subscribe to history
    instructions
      .getInstructions()
      .then((isEmpty) => {
        if (isEmpty) {
          pipeline.changeCurrentPhaseOrStatus(
            PipelineStatusEnum.Insufficient_Resources,
          );
        }
      })
      .catch((err) => console.error(err));
  }

  /**
   * Clean ups
   *    destroy states
   *    clear caches
   *    save current url in local storage
   */
  function finalize() {
    // @ts-ignore
    store.destroy();
  }

  const useReactStore = createReact<StoreApi<object>>(store);

  const engine: EngineNew<
    object,
    AimFlatObjectBase<TObject>,
    typeof config.sequenceName
  > = {
    useStore: useReactStore,
    subscribeToStore: useReactStore.subscribe,

    // @ts-ignore
    instructions,
    visualizations,
    // @ts-ignore
    pipeline,

    finalize,
    initialize,
  };

  if ('__DEV__') {
    // @ts-ignore
    window[name] = engine;
  }

  console.log('whoke store --->', useReactStore.getState());

  return engine;
}

export default createEngine;
