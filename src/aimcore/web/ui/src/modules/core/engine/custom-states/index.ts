import { isEmpty, omit } from 'lodash-es';

import {
  createStateSlices,
  PreCreatedStateSlice,
} from 'modules/core/utils/store';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';
import setStatePersistence from 'modules/core/utils/setStatePersistence';
import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';

import {
  PersistenceTypesEnum,
  StatePersistOption,
  StoreSliceMethods,
} from '../types';

export type CustomStatesEngine = {
  // @ts-ignore
  initialize: () => () => void;
  [key: string]: Omit<PreCreatedStateSlice, 'methods'> & StoreSliceMethods;
};

function createCustomStatesEngine(
  config: ExplorerEngineConfiguration,
  store: any,
  persist?: boolean, // TODO later use StatePersistOption
) {
  const customStates: Record<string, PreCreatedStateSlice> = createStateSlices(
    config.states || {},
  );

  const engine: Record<
    string,
    Omit<PreCreatedStateSlice, 'methods'> & StoreSliceMethods
  > = {};

  const initialState: Record<string, any> = {};
  const initializers: Function[] = [];

  Object.keys(customStates).forEach((name: string) => {
    const state: PreCreatedStateSlice = customStates[name];
    initialState[name] = state.initialState;
    const originalMethods = state.methods(store.setState, store.getState);
    const persistenceKey = ['cs', name].join('-');
    const persistenceType = persist ? config.states?.[name].persist : undefined;
    const overrideMethods = setStatePersistence(
      persistenceKey,
      persistenceType as PersistenceTypesEnum,
      originalMethods,
    );

    engine[name] = {
      ...omit(state, 'methods'),
      ...overrideMethods,
    };

    initializers.push(
      createInitializer(
        persistenceKey,
        originalMethods.update,
        originalMethods.reset,
        persistenceType,
      ),
    );
  });

  /**
   * Initialize custom states
   * @param {String} key - key to identify in storage
   * @param {Function} update - state update method
   * @param {Function} reset - state reset method
   * @param {PersistenceTypesEnum} persist @optional - persistence type
   */
  function createInitializer(
    key: string,
    update: StoreSliceMethods['update'],
    reset: StoreSliceMethods['reset'],
    persist?: StatePersistOption,
  ) {
    return (): Function => {
      if (persist === PersistenceTypesEnum.Url) {
        const stateFromStorage = getUrlSearchParam(key) || {};

        // update state
        if (!isEmpty(stateFromStorage)) {
          update(stateFromStorage);
        }
        const removeListener = browserHistory.listenSearchParam(
          key,
          (data: unknown) => {
            // update state
            if (!isEmpty(data)) {
              update(data);
            } else {
              reset();
            }
          },
          ['PUSH'],
        );

        return () => {
          removeListener();
        };
      }
      return () => {};
    };
  }

  function initialize() {
    if (persist) {
      const finalizers: Function[] = [];
      // call initializers
      initializers.forEach((init) => {
        const finalizer = init();
        finalizers.push(finalizer);
      });
      // call finalizers
      return () => {
        finalizers.forEach((f) => f());
      };
    }
    return () => {};
  }

  return {
    state: {
      customStates: initialState,
    },
    engine: {
      initialize,
      ...engine,
    } as CustomStatesEngine,
  };
}

export default createCustomStatesEngine;
