import type { FunctionComponent } from 'react';
import { StoreApi } from 'zustand';
import { omit } from 'lodash-es';

import {
  IBoxProps,
  IControlsProps,
  IEngineStates,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';
import { createSliceState } from 'modules/core/utils/store';

import { ControlsConfigs } from '../explorer/state/controls';

import { createControlsStateConfig } from './controls';

type BoxConfig = {
  initialState: {
    width: number;
    height: number;
    gap: number;
  };
  component: FunctionComponent<IBoxProps>;
};

export type VisualizationConfig = {
  controls: ControlsConfigs;
  extendDefaultControls?: boolean;
  component?: FunctionComponent<IVisualizationProps>;
  controlsContainer?: FunctionComponent<IControlsProps>;
  box: BoxConfig;
  states?: IEngineStates;
};

export type BoxState = BoxConfig['initialState'];

export type VisualizationsConfig = {
  [key: string]: VisualizationConfig;
};

const VISUALIZATIONS_STATE_PREFIX = 'visualizations';

function createVisualizationStatePrefix(prefix: string) {
  return `${VISUALIZATIONS_STATE_PREFIX}.${prefix}`;
}

export function createState(
  store: any,
  visualizationName: string,
  controlsConfig: ControlsConfigs,
) {
  if (!controlsConfig) return {};
  const controlsStateConfig = createControlsStateConfig(
    controlsConfig,
    createVisualizationStatePrefix(visualizationName),
  );

  const resetMethods: (() => void)[] = [];

  const controlsProperties = Object.keys(controlsStateConfig.slices).reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem = controlsStateConfig.slices[name];
      const methods = elem.methods(store.setState, store.getState);
      resetMethods.push(methods.reset);
      acc[name] = {
        ...elem,
        methods,
      };
      return acc;
    },
    {},
  );

  function reset() {
    resetMethods.forEach((func) => {
      func();
    });
  }

  return {
    initialState: controlsStateConfig.initialState,
    properties: controlsProperties,
    reset,
  };
}

function createVisualizationEngine<TStore>(
  config: VisualizationConfig,
  visualizationName: string,
  store: StoreApi<TStore>,
) {
  const controlsState = createState(store, visualizationName, config.controls);

  const boxConfigState = createSliceState<BoxConfig['initialState']>(
    config.box.initialState,
    `${createVisualizationStatePrefix(visualizationName)}.box`,
  );

  const visualizationState = {
    [visualizationName]: {
      controls: { ...controlsState.initialState },
      box: boxConfigState.initialState,
    },
  };
  const boxMethods = boxConfigState.methods(store.setState, store.getState);

  const engine = {
    [visualizationName]: {
      controls: {
        ...controlsState.properties,
        reset: controlsState.reset,
      },
      box: {
        ...omit(boxConfigState, ['methods']),
        methods: boxMethods,
      },
      reset: () => {
        boxMethods.reset();
        // @ts-ignore
        controlsState.reset();
      },
    },
  };

  return {
    state: visualizationState,
    engine,
  };
}

// name.visualizations.controls
function createVisualizationsEngine<TStore>(
  config: VisualizationsConfig,
  store: any,
) {
  const defaultACC = {
    state: {},
    engine: {},
  };

  const resetFunctions: (() => void)[] = [];

  const obj = Object.keys(omit(config, 'component')).reduce(
    (acc: any, name: string) => {
      // @ts-ignore
      const { state, engine } = createVisualizationEngine<TStore>(
        config[name],
        name,
        store,
      );

      // @ts-ignore
      acc.state = {
        // @ts-ignore
        ...acc.state,
        ...state,
      };

      // @ts-ignore
      acc.engine = {
        // @ts-ignore
        ...acc.engine,
        ...engine,
      };
      resetFunctions.push(engine[name].reset);
      return acc;
    },
    defaultACC,
  );

  function resetVisualizationsState() {
    resetFunctions.forEach((func) => {
      func();
    });
  }
  return {
    state: {
      [VISUALIZATIONS_STATE_PREFIX]: obj.state,
    },
    engine: {
      ...obj.engine,
      reset: resetVisualizationsState,
    },
  };
}

export default createVisualizationsEngine;
