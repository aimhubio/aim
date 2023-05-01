import type { FunctionComponent } from 'react';
import { StoreApi } from 'zustand';
import { isEmpty, omit } from 'lodash-es';

import {
  IBoxContentProps,
  IControlsProps,
  IEngineStates,
  IVisualizationProps,
} from 'modules/BaseExplorer/types';
import { createSliceState } from 'modules/core/utils/store';
import getUpdatedUrl from 'modules/core/utils/getUpdatedUrl';
import browserHistory from 'modules/core/services/browserHistory';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';

import getStateFromLocalStorage from 'utils/getStateFromLocalStorage';
import { encode } from 'utils/encoder/encoder';

import { ControlsConfigs } from '../explorer/state/controls';
import { PersistenceTypesEnum } from '../types';

import { createControlsStateConfig } from './controls';

type BoxConfig = {
  persist?: boolean; // TODO later use StatePersistTypesEnum
  initialState: {
    width: number;
    height: number;
    gap: number;
  };
  stacking: boolean;
  component: FunctionComponent<IBoxContentProps>;
};

export type VisualizationConfig = {
  controls: ControlsConfigs;
  extendDefaultControls?: boolean;
  component?: FunctionComponent<IVisualizationProps>;
  widgets?: WidgetsConfig;
  controlsContainer?: FunctionComponent<IControlsProps>;
  box: BoxConfig;
  states?: IEngineStates;
};

export type WidgetsConfig = Record<
  string,
  {
    component: FunctionComponent<any>;
    props?: object;
  }
>;

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

  const boxConfigState = createSliceState<BoxState>(
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

  const customControlResets: CallableFunction[] = [];

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

        customControlResets.forEach((func) => func());
      },

      initialize: (keyNamePrefix: string = 'core-viz') => {
        const funcs: CallableFunction[] = [];
        Object.keys(config.controls).forEach((key: string) => {
          const control = config.controls[key];
          const persistenceType = control?.state?.persist;
          const persistenceKey = [visualizationName, 'c', key].join('-');
          if (persistenceType) {
            if (persistenceType === PersistenceTypesEnum.Url) {
              const originalMethods =
                // @ts-ignore
                { ...controlsState.properties[key].methods };
              const stateFromStorage = getUrlSearchParam(persistenceKey) || {};

              // update state
              if (!isEmpty(stateFromStorage)) {
                originalMethods.update(stateFromStorage);
              }
              // @ts-ignore
              controlsState.properties[key].methods.update = (d: any) => {
                originalMethods.update(d);

                const url = getUpdatedUrl(persistenceKey, encode(d));

                if (
                  url !== `${window.location.pathname}${window.location.search}`
                ) {
                  browserHistory.push(url, null);
                }
              };

              // @ts-ignore
              controlsState.properties[key].methods.reset = () => {
                originalMethods.reset();

                const url = getUpdatedUrl(persistenceKey, null);

                if (
                  url !== `${window.location.pathname}${window.location.search}`
                ) {
                  browserHistory.push(url, null);
                }
              };
              customControlResets.push(
                // @ts-ignore
                controlsState.properties[key].methods.reset,
              );
              const removeListener = browserHistory.listenSearchParam<any>(
                persistenceKey,
                (data: any) => {
                  if (isEmpty(data)) {
                    // @ts-ignore
                    originalMethods.reset();
                  } else {
                    // @ts-ignore
                    originalMethods.update(data);
                  }
                },
                ['PUSH'],
              );

              funcs.push(removeListener);
            }
          }
        });

        if (config.box.persist) {
          const boxPersistenceKey = `${keyNamePrefix}.${createVisualizationStatePrefix(
            visualizationName,
          )}.box`;

          const boxStateFromStorage =
            getStateFromLocalStorage(boxPersistenceKey);
          const originalMethods = { ...boxMethods };

          if (!isEmpty(boxStateFromStorage)) {
            boxMethods.update(boxStateFromStorage);
          } else {
            boxMethods.reset();
          }

          boxMethods.reset = () => {
            originalMethods.reset();
            localStorage.removeItem(boxPersistenceKey);
          };

          boxMethods.update = (newValue: Partial<BoxState>) => {
            originalMethods.update(newValue);
            localStorage.setItem(boxPersistenceKey, encode(newValue));
          };
        }

        return () => {
          funcs.forEach((func) => func());
        };
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

  function initialize(engineName: string = 'core-viz') {
    const funcs: CallableFunction[] = [];
    Object.values(obj.engine).forEach((e: any) => {
      const func = e.initialize(engineName);
      funcs.push(func);
    });

    return () => {
      funcs.forEach((func) => func());
    };
  }

  return {
    state: {
      [VISUALIZATIONS_STATE_PREFIX]: obj.state,
    },
    engine: {
      ...obj.engine,
      initialize,
      reset: resetVisualizationsState,
    },
  };
}

export default createVisualizationsEngine;
