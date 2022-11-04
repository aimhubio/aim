import createReact, { StoreApi, UseBoundStore } from 'zustand';
import type { Update } from 'history';

import createVanilla from 'zustand/vanilla';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { PipelineOptions } from 'modules/core/pipeline';
import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import createPipelineEngine, { IPipelineEngine } from '../pipeline';
import createInstructionsEngine, { IInstructionsEngine } from '../instructions';
import { PipelineStatusEnum } from '../types';
import createVisualizationsEngine from '../visualizations';
import createExplorerAdditionalEngine from '../explorer';
import createCustomStatesEngine, { CustomStatesEngine } from '../custom-states';
import createEventSystemEngine, { IEventSystemEngine } from '../event-system';
import createBlobURISystemEngine, {
  IBlobURISystemEngine,
} from '../blob-uri-system';

type State = {
  pipeline?: any;
  instructions?: any;
  explorer?: any;
  visualizations?: any;
  events?: IEventSystemEngine['state'];
  blobURI?: any;
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
  initialize: () => () => void;
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
    persist: config.persist,
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
  persist?: boolean, //StatePersistOption,
) {
  return createExplorerAdditionalEngine<State>(
    config,
    {
      setState: set,
      getState: get,
    },
    persist,
  );
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

function getBlobURIEngine(config: ExplorerEngineConfiguration) {
  const blobURI = createBlobURISystemEngine(config.sequenceName);

  return blobURI.engine;
}

function createEngine<TObject = any>(
  config: ExplorerEngineConfiguration,
  basePath: string,
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
  let blobURI: IBlobURISystemEngine['engine'];
  let query: any;
  let groupings: any;
  let initialState = {};
  function buildEngine(set: any, get: any) {
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

    initialState = {
      ...initialState,
      ...customStates.state.initialState,
    };
    customStatesEngine = customStates.engine;

    /**
     * Explorer Additional, includes query and groupings
     */
    const explorer = getExplorerAdditionalEngines(
      config,
      set,
      get,
      config.persist,
    );
    initialState = {
      ...initialState,
      ...explorer.initialState,
    };

    query = explorer.engine.query;
    groupings = explorer.engine.groupings;

    /**
     * Instructions
     */
    instructions = getInstructionsEngine(config, set, get, initialState);

    /**
     * Pipeline
     */
    pipeline = getPipelineEngine(config, set, get, initialState);

    /*
     * Visualizations
     */
    visualizations = getVisualizationsEngine(config, set, get, initialState);

    /** Additional **/

    /*
     * Event System
     */
    events = getEventSystemEngine(initialState, set, get);

    /**
     * @TODO add notification engine here
     */
    /**
     * @TODO add blobs_uri engine here
     */
    /*
     * Blob URI System
     */
    blobURI = getBlobURIEngine(config);

    return initialState;
  }

  // @ts-ignore
  const store = createVanilla<StoreApi<object>>(
    // @ts-ignore
    subscribeWithSelector(
      devtool
        ? // @ts-ignore
          devtools(buildEngine, {
            name,
            anonymousActionType: 'UNKNOWN_ACTION',
            serialize: { options: true },
          })
        : buildEngine,
    ),
  );

  // @ts-ignore
  const useReactStore = createReact<StoreApi<object>>(store);
  /*
   * An initializer to use for url sync and bookmarks data get
   */
  function initialize(): () => void {
    const finalizeQuery = query.initialize();
    const finalizeGrouping = groupings.initialize();
    const finalizePipeline = pipeline.initialize();
    const finalizeVisualizations = visualizations.initialize(name);

    // subscribe to history
    instructions
      .getInstructions()
      .then((isEmpty) => {
        if (isEmpty) {
          pipeline.changeCurrentPhaseOrStatus(
            PipelineStatusEnum.Insufficient_Resources,
          );
        } else if (config.persist) {
          const stateFromStorage = getUrlSearchParam('query') || {};
          if (stateFromStorage.form && stateFromStorage.ranges) {
            pipeline.search(
              getQueryParamsFromState(stateFromStorage, config.sequenceName),
              true,
            );
          }
        }
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error(err));

    const removeHistoryListener =
      config.persist &&
      browserHistory.listen((update: Update) => {
        localStorage.setItem(
          'figuresUrl',
          update.location.pathname + update.location.search,
        );
      });

    return () => {
      finalizeQuery();
      finalizeGrouping();
      finalizePipeline();
      finalizeVisualizations();
      removeHistoryListener && removeHistoryListener();

      finalize();
    };
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
    useReactStore.setState(initialState);
    // pipeline.destroy(); // or pipeline release/commit
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
    // @ts-ignore
    blobURI,
    finalize,
    initialize,
  };

  // if (__DEV__) {
  //   // @ts-ignore
  //   window[name] = engine;
  // }

  return engine;
}

export default createEngine;
