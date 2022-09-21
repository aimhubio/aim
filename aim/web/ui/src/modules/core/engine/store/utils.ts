import { get as getValue, set as setValue } from 'lodash-es';
import produce, { Draft } from 'immer';

import { buildObjectHash } from 'modules/core/utils/hashing';

import {
  GetState,
  SetState,
  SliceMethods,
  StateSelector,
} from 'utils/store/createSlice';

import { GenerateStoreMethods, IEngineConfigFinal } from '../types';

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

//@TODO merge to createSlice
export function createDefaultBoxStateSlice(config: {
  width: number;
  height: number;
  gap: number;
}) {
  const initialBoxConfig = config;
  const boxConfigSelector = (state: any) => state.boxConfig;
  const initialStateHash = buildObjectHash(initialBoxConfig);

  const generateBoxConfigMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ) => {
    function update(newBoxConfig: {
      width?: number;
      height?: number;
      gap?: number;
    }) {
      const newStateHash = buildObjectHash(newBoxConfig);
      const updatedConfig = {
        // @ts-ignore
        ...get().boxConfig,
        ...newBoxConfig,
        isInitial: initialStateHash === newStateHash,
      };

      set({
        boxConfig: updatedConfig,
      });
    }

    function reset() {
      set({
        boxConfig: {
          ...initialBoxConfig,
          isInitial: true,
        },
      });
    }
    return { update, reset };
  };

  return {
    initialState: {
      ...initialBoxConfig,
      isInitial: true,
    },
    stateSelector: boxConfigSelector,
    methods: generateBoxConfigMethods,
  };
}

// QUERY SLICE
type QueryUIStateUnit = {
  simpleInput: string | null;
  advancedInput: string | null;
  selections: Array<any>;
  advancedModeOn: boolean;
};

export type PreCreatedStateSlice = {
  initialState: object;
  stateSelector: Function;
  methods: GenerateStoreMethods;
};

export type CustomStates<T = any> = {
  [key: string]: {
    initialState: Record<string, T>;
  };
};

//@TODO merge to createSlice
export function createQueryUISlice(
  initialState: QueryUIStateUnit,
): PreCreatedStateSlice {
  const initialStateHash = buildObjectHash(initialState);

  const selector = (state: any) => state.queryUI;

  const generateMethods: GenerateStoreMethods = <T>(
    set: SetState<T>,
    get: GetState<T>,
  ) => {
    function update(newState: QueryUIStateUnit) {
      const newStateHash = buildObjectHash(newState);
      const updated = {
        // @ts-ignore
        ...get().queryUI,
        ...newState,
        isInitial: initialStateHash === newStateHash,
      };

      set({
        // @ts-ignore
        queryUI: updated,
        isInitial: initialStateHash === newStateHash,
      });
    }

    function reset() {
      set({
        // @ts-ignore
        queryUI: { ...initialState, isInitial: true },
      });
    }

    return { update, reset };
  };

  return {
    methods: generateMethods,
    initialState: {
      ...initialState,
      isInitial: true,
    },
    stateSelector: selector,
  };
}
// QUERY SLICE

export function createConfiguration(config: IEngineConfigFinal): {
  states: {
    names: string[];
    values: {
      [key: string]: PreCreatedStateSlice;
    };
  };
} {
  const defaultStates: {
    [key: string]: PreCreatedStateSlice;
  } = {};

  const defaultBoxConfig = config.defaultBoxConfig;

  defaultStates['boxConfig'] = createDefaultBoxStateSlice(defaultBoxConfig);
  defaultStates['queryUI'] = createQueryUISlice({
    simpleInput: '',
    advancedInput: '',
    selections: [],
    advancedModeOn: true,
  });

  const names = [
    ...Object.keys(defaultStates),
    ...Object.keys(config.states || {}),
  ];

  const customStates: {} = createStateSlices(config.states);

  const values = {
    ...defaultStates,
    ...customStates,
  };

  return {
    states: {
      names,
      values,
    },
  };
}
