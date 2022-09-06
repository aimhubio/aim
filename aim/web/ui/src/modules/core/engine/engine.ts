import createReact, { StoreApi, UseBoundStore } from 'zustand';

import createVanilla from 'zustand/vanilla';
import { PipelineOptions } from 'modules/core/pipeline';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

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
};

type Engine<TStore, TObject, SequenceName extends SequenceTypesEnum> = {
  // sub engines
  pipeline: IPipelineEngine<TObject, TStore>['engine'];
  instructions: IInstructionsEngine<TStore, SequenceName>['engine'];

  // methods
  initialize: () => void;
  finalize: () => void;

  // store helpers
  useStore: UseBoundStore<StoreApi<TStore>>;
  subscribeToStore: (listener: (state: TStore) => void) => void;
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
  state['pipeline'] = pipeline.state.pipeline;

  return pipeline.engine;
}

function getInstructionsEngine(
  config: IEngineConfigFinal,
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
  config: IEngineConfigFinal,
  set: any,
  get: any,
  state: State, // mutable
) {
  const explorer = createExplorerEngine<object>(config, {
    setState: set,
    getState: set,
  });

  // state['explorer'] = explorer.state.explorer;

  // return explorer.engine;
}

function createEngine<TObject = any>(
  config: IEngineConfigFinal,
  name: string = 'baseEngine',
): Engine<object, AimFlatObjectBase<TObject>, typeof config.sequenceName> {
  let pipeline: IPipelineEngine<AimFlatObjectBase<TObject>, object>['engine'];
  let instructions: IInstructionsEngine<
    object,
    typeof config.sequenceName
  >['engine'];

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
    const c: VisualizationsConfig = {
      viz1: {
        component: () => null,
        controls: config.controls || {},
        box: {
          initialState: config.defaultBoxConfig,
          component: () => null,
        },
      },
      viz2: {
        component: () => null,
        controls: config.controls || {},
        box: {
          initialState: config.defaultBoxConfig,
          component: () => null,
        },
      },
    };
    const s = createVisualizationsEngine<State>(c, {
      setState: set,
      getState: get,
    });

    console.log(s);
    /**
     * Custom states
     */
    return state;
  });

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

  const engine: Engine<
    object,
    AimFlatObjectBase<any>,
    typeof config.sequenceName
  > = {
    useStore: useReactStore,
    subscribeToStore: useReactStore.subscribe,

    // @ts-ignore
    instructions,
    // @ts-ignore
    pipeline,

    finalize,
    initialize,
  };

  if ('__DEV__') {
    // @ts-ignore
    window[name] = engine;
  }

  return engine;
}

export default createEngine;
