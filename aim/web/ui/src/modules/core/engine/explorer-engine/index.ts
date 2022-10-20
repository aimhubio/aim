import createReact, { StoreApi, UseBoundStore } from 'zustand';

import createVanilla from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';
import { PipelineOptions } from 'modules/core/pipeline';
import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import createPipelineEngine, { IPipelineEngine } from '../pipeline';
import createInstructionsEngine, { IInstructionsEngine } from '../instructions';
import { PipelineStatusEnum } from '../types';
import createVisualizationsEngine from '../visualizations';
import createExplorerAdditionalEngine from '../explorer';
import createCustomStatesEngine, { CustomStatesEngine } from '../custom-states';
import createEventSystemEngine, { IEventSystemEngine } from '../event-system';

type State = {
  pipeline?: any;
  instructions?: any;
  explorer?: any;
  visualizations?: any;
  events?: any;
};

export type EngineNew<
  TStore,
  TObject,
  SequenceName extends SequenceTypesEnum,
> = {
  // sub engines
  pipeline: IPipelineEngine<TObject, TStore>['engine'];
  instructions: IInstructionsEngine<TStore, SequenceName>['engine'];
  events: IEventSystemEngine['engine'];
  visualizations: any;

  // methods
  initialize: () => Promise<boolean>;
  finalize: () => void;

  // store helpers
  useStore: UseBoundStore<StoreApi<TStore>>;
  subscribeToStore: (listener: (state: TStore) => void) => void;
} & CustomStatesEngine;

function getPipelineEngine(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  state: State, // mutable
) {
  const useCache = config.enablePipelineCache;

  const defaultGroupings = Object.keys(config.groupings || {}).reduce(
    // @ts-ignore
    (acc: object, key: string) => {
      // @ts-ignore
      acc[key] = config.groupings?.[key].defaultApplications;
      return acc;
    },
    {},
  );

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
    defaultGroupings,
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

function getExplorerAdditionalEngines(
  config: ExplorerEngineConfiguration,
  set: any,
  get: any,
  // state: State, // mutable
) {
  return createExplorerAdditionalEngine<State>(config, {
    setState: set,
    getState: get,
  });
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

  return visualizations.engine;
}

function getEventSystemEngine(
  state: State, // mutable
  set: any,
  get: any,
) {
  const events = createEventSystemEngine({ setState: set, getState: get });

  state['events'] = events.state;

  return events.engine;
}

function createEngine<TObject = any>(
  config: ExplorerEngineConfiguration,
  name: string = 'ExplorerEngine',
  devtool: boolean = false,
): EngineNew<object, AimFlatObjectBase<TObject>, typeof config.sequenceName> {
  let pipeline: IPipelineEngine<AimFlatObjectBase<TObject>, object>['engine'];
  let instructions: IInstructionsEngine<
    object,
    typeof config.sequenceName
  >['engine'];

  let visualizations: any;

  let customStatesEngine: CustomStatesEngine;
  let events: IEventSystemEngine['engine'];
  let query: any;
  let groupings: any;

  function buildEngine(set: any, get: any) {
    let state = {};

    /**
     * Custom states
     */
    const customStates = createCustomStatesEngine(
      {
        setState: set,
        getState: get,
      },
      config.states,
    );

    state = {
      ...state,
      ...customStates.state.initialState,
    };
    customStatesEngine = customStates.engine;

    /**
     * Explorer Additional, includes query and groupings
     */
    const explorer = getExplorerAdditionalEngines(config, set, get);
    state = {
      ...state,
      ...explorer.initialState,
    };

    query = explorer.engine.query;
    groupings = explorer.engine.groupings;

    /**
     * Instructions
     */
    instructions = getInstructionsEngine(config, set, get, state);

    /**
     * Pipeline
     */
    pipeline = getPipelineEngine(config, set, get, state);

    /*
     * Visualizations
     */
    visualizations = getVisualizationsEngine(config, set, get, state);

    /** Additional **/

    /**
     * @TODO add notification engine here
     */
    /**
     * @TODO add blobs_uri engine here
     */

    /*
     * Event System
     */
    events = getEventSystemEngine(state, set, get);

    return state;
  }

  // @ts-ignore
  const store = createVanilla<StoreApi<object>>(
    // @ts-ignore
    devtool
      ? // @ts-ignore
        devtools(buildEngine, {
          name,
          anonymousActionType: 'UNKNOWN_ACTION',
          serialize: { options: true },
        })
      : buildEngine,
  );

  // @ts-ignore
  const useReactStore = createReact<StoreApi<object>>(store);
  /*
   * An initializer to use for url sync and bookmarks data get
   */
  function initialize(): Promise<boolean> {
    // subscribe to history
    return new Promise((resolve, reject) => {
      instructions
        .getInstructions()
        .then((isEmpty) => {
          if (isEmpty) {
            pipeline.changeCurrentPhaseOrStatus(
              PipelineStatusEnum.Insufficient_Resources,
            );
          }
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.error(err));
    });
  }
  /**
   * Clean ups
   *    destroy states
   *    clear caches
   *    save current url in local storage
   */
  function finalize() {
    // @ts-ignore
    useReactStore.destroy(); // or engine.release/commit
    pipeline.destroy(); // or pipeline release/commit
  }

  // @ts-ignore
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
    ...customStatesEngine,
    query,
    groupings,
    // @ts-ignore
    pipeline,
    // @ts-ignore
    events,

    finalize,
    initialize,
  };

  if (__DEV__) {
    // @ts-ignore
    window[name] = engine;
  }

  return engine;
}

export default createEngine;
