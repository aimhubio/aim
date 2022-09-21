import { omit } from 'lodash-es';

import {
  createStateSlices,
  CustomStates,
  PreCreatedStateSlice,
} from 'modules/core/utils/store';

import { StoreSliceMethods } from '../types';

export interface CustomStatesEngine {
  [key: string]: Omit<PreCreatedStateSlice, 'methods'> & StoreSliceMethods;
}

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

  Object.keys(customStates).forEach((name: string) => {
    const state: PreCreatedStateSlice = customStates[name];
    initialState[name] = state.initialState;
    engine[name] = {
      ...omit(state, 'methods'),
      ...state.methods(store.setState, store.getState),
    };
  });

  return {
    state: {
      initialState,
    },
    engine,
  };
}

export default createCustomStatesEngine;
