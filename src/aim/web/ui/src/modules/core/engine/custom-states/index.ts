import { isEmpty, omit } from 'lodash-es';

import {
  createStateSlices,
  CustomStates,
  PreCreatedStateSlice,
} from 'modules/core/utils/store';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';
import setStatePersistence from 'modules/core/utils/setStatePersistence';

import {
  PersistenceTypesEnum,
  StatePersistOption,
  StoreSliceMethods,
} from '../types';

export type CustomStatesEngine = {
  [key: string]: Omit<PreCreatedStateSlice, 'methods'> & StoreSliceMethods;
} & {
  initialize: () => () => void;
};

function createCustomStatesEngine(store: any, config: CustomStates = {}) {
  const customStates: Record<string, PreCreatedStateSlice> = createStateSlices(
    config || {},
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
    const persistenceType = config[name].persist;
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
        config[name].persist,
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

  const initialize = () => {
    const finalizers: Function[] = [];
    // call initializers
    initializers.forEach((init) => {
      const finalizer = init();
      finalizers.push(finalizer);
    });
    // call finalizers
    return () => {
      finalizers.forEach((finalizer) => {
        finalizer();
      });
    };
  };

  return {
    state: {
      initialState,
    },
    engine,
    initialize,
  };
}

export default createCustomStatesEngine;
