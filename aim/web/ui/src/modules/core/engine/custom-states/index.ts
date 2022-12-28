import { isEmpty, omit } from 'lodash-es';

import {
  createStateSlices,
  CustomStates,
  PreCreatedStateSlice,
} from 'modules/core/utils/store';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';
import getUpdatedUrl from 'modules/core/utils/getUpdatedUrl';

import { encode } from 'utils/encoder/encoder';

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
  const customStates: {
    [key: string]: PreCreatedStateSlice;
  } = createStateSlices(config || {});

  const engine: {
    [key: string]: Omit<PreCreatedStateSlice, 'methods'> & StoreSliceMethods;
  } = {};

  const initialState: {
    [key: string]: any;
  } = {};

  const intializers: (() => void)[] = [];

  Object.keys(customStates).forEach((name: string) => {
    const state: PreCreatedStateSlice = customStates[name];
    initialState[name] = state.initialState;
    const originalMethods = state.methods(store.setState, store.getState);
    // @ts-ignore
    const overrideMethods = { ...originalMethods };
    const persistenceKey = ['cs', name].join('-');

    const persistenceType = config[name].persist;
    if (persistenceType) {
      if (persistenceType === PersistenceTypesEnum.Url) {
        const stateFromStorage = getUrlSearchParam(persistenceKey) || {};

        // update state
        if (!isEmpty(stateFromStorage)) {
          originalMethods.update(stateFromStorage);
        }
        overrideMethods.update = (d: any) => {
          originalMethods.update(d);
          const url = getUpdatedUrl(persistenceKey, encode(d));

          if (url !== `${window.location.pathname}${window.location.search}`) {
            browserHistory.push(url, null);
          }
        };

        overrideMethods.reset = () => {
          originalMethods.reset();

          const url = getUpdatedUrl(persistenceKey, encode({}));

          if (url !== `${window.location.pathname}${window.location.search}`) {
            browserHistory.push(url, null);
          }
        };
      }
    }
    engine[name] = {
      ...omit(state, 'methods'),
      ...overrideMethods,
    };

    intializers.push(
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
    return (): (() => void) => {
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
    const finalizers: (() => void)[] = [];
    // call initializers
    intializers.forEach((init) => {
      const finalizer = init();
      // @ts-ignore
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
