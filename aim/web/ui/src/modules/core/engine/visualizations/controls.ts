import { omit } from 'lodash-es';

import { createSliceState } from 'modules/core/utils/store';

import { StatePersistOption } from '../types';

export type ControlConfig<State extends object, Settings> = {
  /**
   * Name of control, using as unique key of control
   */
  name: string;
  component: Function;
  /**
   * Observable state
   * The things kept on this object is observable, and aimed to use from controls
   */
  state?: {
    initialState: State;
    persist?: StatePersistOption;
  };
  /**
   * Static settings, i.e.
   * {
   *     maxWidth: 400,
   *     minWidth: 100,
   *     step: 10,
   * }
   */
  settings?: Record<string, Settings>;
};

export type ControlsConfigs = {
  [name: string]: Omit<ControlConfig<unknown & object, any>, 'name'>;
};

export type ControlsConfigsNew = {
  [name: string]: Omit<ControlConfig<unknown & object, any>, 'name'>;
};

function createControl(
  config: ControlConfig<unknown & object, any>,
  statePrefix: string = '',
) {
  const {
    name,
    component,
    state = { initialState: {} },
    settings = {},
  } = config;

  const observableState = createSliceState(
    state.initialState,
    `${statePrefix}.controls.${name}`,
  );

  return {
    settings,
    component,
    observableState,
  };
}

function createControlsSlice(slices: { [key: string]: any }) {
  let initialState: Record<string, any> = {};
  const subSlices: Record<string, any> = {};

  Object.keys(slices).forEach((name) => {
    const slice = slices[name];
    initialState = {
      ...initialState,
      [name]: slice.observableState.initialState,
    };
    subSlices[name] = {
      ...omit(slice, 'observableState'),
      ...slice.observableState,
    };
  });

  return {
    initialState,
    slices: subSlices,
  };
}

function createControlsStateConfig(
  configs: ControlsConfigs = {},
  statePrefix: string,
) {
  const controls: { [key: string]: any } = {};

  Object.keys(configs).forEach((name: string) => {
    controls[name] = createControl(
      {
        name,
        ...configs[name],
      },
      statePrefix,
    );
  });

  return createControlsSlice(controls);
}

export { createControlsStateConfig };
