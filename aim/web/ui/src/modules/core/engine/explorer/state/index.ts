import { StoreApi } from 'zustand';
import { omit } from 'lodash-es';

import { IEngineConfigFinal } from '../../types';
import {
  createDefaultBoxStateSlice,
  createQueryUISlice,
  createStateSlices,
  PreCreatedStateSlice,
} from '../../store/utils';
import { ExplorerEngineConfiguration } from '../../../../BaseExplorerNew/types';

import { createControlsStateConfig } from './controls';
import { createGroupingsStateConfig } from './grouping';

function createConfiguration(config: IEngineConfigFinal): {
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
    advancedModeOn: false,
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

function createState<TStore>(config: any, store: StoreApi<TStore>) {
  // const { states } = createConfiguration(config);
  /*states.names.reduce(
    (acc: { [key: string]: object }, name: string) => {
      acc[name] = states.values[name].initialState;
      return acc;
    },
    {},
  );*/
  const initialState: { [key: string]: object } = {};

  const stateSlicesResetMethods: any[] = [];

  const groupConfigs = createGroupingsStateConfig(config.grouping);
  const controlConfigs = createControlsStateConfig(config.controls);

  const styleAppliers = Object.keys(config.grouping || {}).map(
    (key: string) => {
      return config.grouping?.[key].styleApplier;
    },
  );

  // delete this later because has usage on another experiment (control resetting)
  const defaultApplications = Object.keys(config.grouping || {}).reduce(
    // @ts-ignore
    (acc: object, key: string) => {
      // @ts-ignore
      acc[key] = config.grouping?.[key].defaultApplications;
      return acc;
    },
    {},
  );

  initialState['groupings'] = {
    ...groupConfigs.initialState,
  };

  initialState['controls'] = {
    ...controlConfigs.initialState,
  };

  // grouping
  const encapsulatedGroupProperties = Object.keys(groupConfigs.slices).reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem = groupConfigs.slices[name];
      const methods = elem.methods(store.setState, store.getState);
      stateSlicesResetMethods.push(methods);
      acc[name] = {
        ...omit(elem, ['styleApplier']),
        methods: elem.methods(store.setState, store.getState),
      };
      return acc;
    },
    {},
  );

  const groupingMethods = groupConfigs.generateMethods(
    store.setState,
    store.getState,
  );

  // grouping
  const encapsulatedControlProperties = Object.keys(
    controlConfigs.slices,
  ).reduce((acc: { [key: string]: object }, name: string) => {
    const elem = controlConfigs.slices[name];
    const methods = elem.methods(store.setState, store.getState);
    stateSlicesResetMethods.push(methods);
    acc[name] = {
      ...elem,
      methods,
    };
    return acc;
  }, {});

  return {
    initialState,
    styleAppliers,
    defaultApplications,
    groupings: {
      ...encapsulatedGroupProperties,
      currentValuesSelector: groupConfigs.currentValuesSelector,
      reset: groupingMethods.reset,
    },
    controls: {
      ...encapsulatedControlProperties,
    },
  };
}

export default createState;
