import { get as getValue } from 'lodash-es';

import { GetState, SetState } from 'utils/store/createSlice';

import { GenerateStoreMethods, IEngineConfigFinal } from '../types';

export function createSliceState(initialState: object, name: string) {
  const stateSelector = (state: any) => {
    return getValue(state, name);
  };

  const generateMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ) => {
    function update(newState: object) {
      const updatedState = {
        // @ts-ignore
        ...get()[name],
        ...newState,
      };

      set({
        [name]: updatedState,
      });
    }

    function reset() {
      set({
        [name]: initialState,
      });
    }
    return { update, reset };
  };

  return {
    initialState,
    stateSelector,
    methods: generateMethods,
  };
}

export function createStateSlices(
  states: {
    [name: string]: {
      initialState: object;
    };
  } = {},
) {
  const createdStates: { [key: string]: object } = {};

  Object.keys(states).forEach((name: string) => {
    // @TODO check reserved keys, is properties are valid and throw exception
    const { initialState } = states[name];

    createdStates[name] = createSliceState(initialState, name);
  });

  return createdStates;
}
export function createDefaultBoxStateSlice(config: {
  width: number;
  height: number;
  gap: number;
}) {
  const initialBoxConfig = config;
  const boxConfigSelector = (state: any) => state.boxConfig;

  const generateBoxConfigMethods = <TS extends Function, TG extends Function>(
    set: TS,
    get: TG,
  ) => {
    function update(newBoxConfig: {
      width?: number;
      height?: number;
      gap?: number;
    }) {
      const updatedConfig = {
        // @ts-ignore
        ...get().boxConfig,
        ...newBoxConfig,
      };

      set({
        boxConfig: updatedConfig,
      });
    }

    function reset() {
      set({
        boxConfig: initialBoxConfig,
      });
    }
    return { update, reset };
  };

  return {
    initialState: initialBoxConfig,
    stateSelector: boxConfigSelector,
    methods: generateBoxConfigMethods,
  };
}

// QUERY SLICE
type QueryUIStateUnit = {
  simpleInput: string;
  advancedInput: string;
  selections: Array<any>;
  advancedModeOn: boolean;
};

export type PreCreatedStateSlice = {
  initialState: object;
  stateSelector: Function;
  methods: GenerateStoreMethods;
};

export function createQueryUISlice(
  initialState: QueryUIStateUnit,
): PreCreatedStateSlice {
  const selector = (state: any) => state.queryUI;

  const generateMethods: GenerateStoreMethods = <T>(
    set: SetState<T>,
    get: GetState<T>,
  ) => {
    function update(newState: QueryUIStateUnit) {
      const updated = {
        // @ts-ignore
        ...get().queryUI,
        ...newState,
      };

      set({
        // @ts-ignore
        queryUI: updated,
      });
    }

    function reset() {
      set({
        // @ts-ignore
        queryUI: { ...initialState },
      });
    }

    return { update, reset };
  };

  return {
    methods: generateMethods,
    initialState,
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
