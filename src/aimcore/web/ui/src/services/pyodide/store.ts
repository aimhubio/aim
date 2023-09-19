import { StoreApi, useStore } from 'zustand';
import { omit } from 'lodash-es';
import produce, { Draft } from 'immer';

import createVanilla from 'zustand/vanilla';
import { subscribeWithSelector } from 'zustand/middleware';

import { StatePersistOption } from 'modules/core/engine/types';
import {
  createStateSlices,
  PreCreatedStateSlice,
} from 'modules/core/utils/store';
import createEventSystemEngine, {
  IEventSystemEngine,
} from 'modules/core/engine/event-system';
import createBlobURISystemEngine, {
  IBlobURISystemEngine,
} from 'modules/core/engine/blob-uri-system';

type Set<T> = StoreApi<T>['setState'];
type Get<T> = StoreApi<T>['getState'];

type Pyodide = {
  current: null | any;
  isLoading: null | boolean;
  isRunning: null | boolean;
  namespace: null | any;
  registeredPackages: string[];
  boards: null | Record<string, string[]>;
};

type Layout = {
  tree: Map<string, any> | null;
  state: Record<string, any>;
};

type Slice<T> = {
  initialState: T;
  persist?: StatePersistOption;
};

export type State = {
  pyodide: Pyodide;
  layout: Layout;
  events: Record<string, unknown>;
  blobURI: Record<string, string>;
};

type SelectorCreator<TState, P> = (state: TState) => P;

type Selectors = {
  // Pyodide state selectors
  pyodideSelector: SelectorCreator<State, Pyodide>;
  pyodideCurrentSelector: SelectorCreator<State, Pyodide['current']>;
  pyodideIsLoadingSelector: SelectorCreator<State, Pyodide['isLoading']>;
  pyodideIsRunningSelector: SelectorCreator<State, Pyodide['isRunning']>;
  pyodideNamespaceSelector: SelectorCreator<State, Pyodide['namespace']>;
  pyodideRegisteredPackagesSelector: SelectorCreator<
    State,
    Pyodide['registeredPackages']
  >;
  boardsSelector: SelectorCreator<State, Pyodide['boards']>;
  // Layout state actions
  layoutSelector: SelectorCreator<State, Layout>;
  layoutTreeSelector: SelectorCreator<State, Layout['tree']>;
  layoutStateSelector: SelectorCreator<State, Layout['state']>;
};

type GetMethods = {
  getPyodide: () => Pyodide;
  getPyodideCurrent: () => Pyodide['current'];
  getPyodideIsLoading: () => Pyodide['isLoading'];
  getPyodideIsRunning: () => Pyodide['isRunning'];
  getPyodideNamespace: () => Pyodide['namespace'];
  getPyodideRegisteredPackages: () => Pyodide['registeredPackages'];
  getBoards: () => Pyodide['boards'];
  getLayout: () => Layout;
  getLayoutTree: () => Layout['tree'];
  getLayoutState: () => Layout['state'];
};

type SetMethods = {
  reset: () => void;
  // Pyodide state actions
  setPyodide: (pyodide: Partial<Pyodide>) => void;
  setPyodideCurrent: (current: Pyodide['current']) => void;
  setPyodideIsLoading: (isLoading: Pyodide['isLoading']) => void;
  setPyodideIsRunning: (isRunning: Pyodide['isRunning']) => void;
  setPyodideNamespace: (namespace: Pyodide['namespace']) => void;
  setPyodideRegisteredPackages: (
    registeredPackages: Pyodide['registeredPackages'],
  ) => void;
  setBoards: (boards: Pyodide['boards']) => void;
  // Layout state actions
  setLayout: (layout: Partial<Layout>) => void;
  setLayoutTree: (layoutTree: Layout['tree']) => void;
  setLayoutState: (state: Layout['state']) => void;
};

const engine: Record<string, any> = {};
const initialState: State = {
  pyodide: {
    current: null,
    isLoading: null,
    isRunning: null,
    namespace: null,
    registeredPackages: [],
    boards: null,
  },
  layout: {
    tree: null,
    state: {},
  },
  events: {},
  blobURI: {},
};

const stateCreator = (set: Set<State>, get: Get<State>) => {
  const pyodide: Slice<Pyodide> = {
    initialState: initialState.pyodide,
    // persist?: PersistenceTypesEnum // persistence config can be added here
  };

  const layout: Slice<Layout> = {
    initialState: initialState.layout,
    // persist?: PersistenceTypesEnum // persistence config can be added here
  };

  const slices = createStateSlices({ pyodide, layout });

  Object.keys(slices).forEach((name) => {
    const state: PreCreatedStateSlice = slices[name];
    // @ts-ignore
    const originalMethods = state.methods(set, get);

    engine[name] = {
      ...omit(state, 'methods'),
      ...originalMethods,
    };
    // @ts-ignore
    initialState[name] = state.initialState;
  });

  engine.selectors = generateSelectors();
  engine.setMethods = generateSetMethods(set);
  engine.getMethods = generateGetMethods(get);

  const eventSystemEngine = createEventSystemEngine({
    setState: set,
    getState: get,
  });
  initialState.events = eventSystemEngine.state;
  engine.events = eventSystemEngine.engine;

  const blobURISystemEngine = createBlobURISystemEngine();
  engine.blobURI = blobURISystemEngine.engine;

  return initialState;
};

// @ts-ignore
const store = createVanilla(subscribeWithSelector(stateCreator));

type Subscribe = {
  (
    listener: (selectedState: State, previousSelectedState: State) => void,
  ): () => void;
  <U>(
    selector: (state: State) => U,
    listener: (selectedState: U, previousSelectedState: U) => void,
    options?: {
      equalityFn?: (a: U, b: U) => boolean;
      fireImmediately?: boolean;
    },
  ): () => void;
};

const pyodideEngine: State &
  Selectors &
  SetMethods &
  GetMethods & {
    subscribe: Subscribe;
    events: IEventSystemEngine['engine'];
    blobURI: IBlobURISystemEngine['engine'];
  } = {
  initialState,
  ...omit(engine, 'selectors', 'setMethods', 'getMethods', 'events'),
  ...engine.selectors,
  ...engine.setMethods,
  ...engine.getMethods,
  subscribe: store.subscribe,
  events: engine.events,
  blobURI: engine.blobURI,
};

export const usePyodideEngine = (selector: SelectorCreator<State, any>) =>
  useStore(store, selector);
export default pyodideEngine;

function generateSelectors(): Selectors {
  return {
    // state selectors
    pyodideSelector: (state) => state.pyodide,
    pyodideCurrentSelector: (state) => state.pyodide.current,
    pyodideIsLoadingSelector: (state) => state.pyodide.isLoading,
    pyodideIsRunningSelector: (state) => state.pyodide.isRunning,
    pyodideNamespaceSelector: (state) => state.pyodide.namespace,
    pyodideRegisteredPackagesSelector: (state) =>
      state.pyodide.registeredPackages,
    boardsSelector: (state) => state.pyodide.boards,
    // Layout state actions
    layoutSelector: (state) => state.layout,
    layoutTreeSelector: (state) => state.layout.tree,
    layoutStateSelector: (state) => state.layout.state,
  };
}

function generateGetMethods(get: Get<State>): GetMethods {
  return {
    getPyodide: () => get().pyodide,
    getPyodideCurrent: () => get().pyodide.current,
    getPyodideIsLoading: () => get().pyodide.isLoading,
    getPyodideIsRunning: () => get().pyodide.isRunning,
    getPyodideNamespace: () => get().pyodide.namespace,
    getPyodideRegisteredPackages: () => get().pyodide.registeredPackages,
    getBoards: () => get().pyodide.boards,
    getLayout: () => get().layout,
    getLayoutTree: () => get().layout.tree,
    getLayoutState: () => get().layout.state,
  };
}

function generateSetMethods(set: Set<State>): SetMethods {
  return {
    reset: () => {
      set(initialState, false);
    },
    setPyodide: (pyodide: Partial<Pyodide>) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide = {
            ...draft_state.pyodide,
            ...pyodide,
          };
        }),
        false,
      );
    },
    // Pyodide state actions
    setPyodideCurrent: (current: Pyodide['current']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.current = current;
        }),
        false,
      );
    },
    setPyodideIsLoading: (isLoading: Pyodide['isLoading']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.isLoading = isLoading;
        }),
        false,
      );
    },
    setPyodideIsRunning: (isRunning: Pyodide['isRunning']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.isRunning = isRunning;
        }),
        false,
      );
    },
    setPyodideNamespace: (namespace: Pyodide['namespace']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.namespace = namespace;
        }),
        false,
      );
    },
    setPyodideRegisteredPackages: (
      registeredPackages: Pyodide['registeredPackages'],
    ) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.registeredPackages = registeredPackages;
        }),
        false,
      );
    },
    setBoards: (boards: Pyodide['boards']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.pyodide.boards = boards;
        }),
        false,
      );
    },
    // Layout state actions
    setLayout: (layout: Partial<Layout>) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.layout = {
            ...draft_state.layout,
            ...layout,
          };
        }),
        false,
      );
    },
    setLayoutTree: (tree: Layout['tree']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.layout.tree = tree;
        }),
        false,
      );
    },
    setLayoutState: (state: Layout['state']) => {
      set(
        produce((draft_state: Draft<State>) => {
          draft_state.layout.state = state;
        }),
        false,
      );
    },
  };
}
