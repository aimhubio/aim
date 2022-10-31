import { get as getValue, set as setValue } from 'lodash-es';
import produce, { Draft } from 'immer';

import { buildObjectHash } from 'modules/core/utils/hashing';
import {
  GenerateStoreMethods,
  StatePersistOption,
} from 'modules/core/engine/types';

import { SliceMethods, StateSelector } from 'utils/store/createSlice';

export interface StateSlice<T, TStore> extends SliceMethods<T> {
  initialState: T;
  stateSelector: StateSelector<T, TStore>;
}

export function createSliceState<T, Store = any>(
  initialState: T,
  name: string,
) {
  const stateSelector: StateSelector<T, Store> = (state: Store): T => {
    return getValue(state, name);
  };

  const initialStateHash = buildObjectHash(initialState);

  const generateMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ): SliceMethods<T> => {
    function update(newState: Partial<T>) {
      const prevState = getValue(get(), name);
      const updatedState = {
        ...prevState,
        ...newState,
        isInitial: initialStateHash === buildObjectHash(newState),
      };
      set(
        produce<T>((draft_state: Draft<T>) => {
          // @ts-ignore
          setValue(draft_state, name, updatedState);
        }),
        false,
        `@UPDATE/${name}`,
      );
    }

    function reset() {
      const updatedState = {
        ...initialState,
        isInitial: true,
      };
      set(
        produce<T>((draft_state: Draft<T>) => {
          // @ts-ignore
          setValue(draft_state, name, updatedState);
        }),
        false,
        `@RESET/${name}`,
      );
    }
    return { update, reset };
  };

  return {
    initialState: {
      ...initialState,
      isInitial: true,
    },
    stateSelector,
    methods: generateMethods,
  };
}

export function createStateSlices<T>(states: CustomStates<T> = {}) {
  const createdStates: { [key: string]: PreCreatedStateSlice } = {};

  Object.keys(states).forEach((name: string) => {
    // @TODO check reserved keys, is properties are valid and throw exception
    const { initialState } = states[name];

    createdStates[name] = createSliceState(initialState, name);
  });

  return createdStates;
}

export type PreCreatedStateSlice = {
  initialState: object;
  stateSelector: Function;
  methods: GenerateStoreMethods;
};

export type CustomStates<T = any> = {
  [key: string]: {
    initialState: Record<string, T>;
    persist?: StatePersistOption;
  };
};
