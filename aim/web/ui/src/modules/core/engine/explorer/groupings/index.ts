import { omit } from 'lodash-es';

import { Order } from 'modules/core/pipeline';
import { createSliceState } from 'modules/core/utils/store';

import createGroupingsSlice from './state';

type StyleApplierCallback<S> = (
  object: any,
  group: Array<string>,
  state: S,
) => { [key: string]: unknown };

export type GroupingConfig<State extends object, Settings> = {
  /**
   * Name of grouping, using as unique key of grouping
   */
  name: string;
  component: Function;
  /**
   * Observable state
   * The things kept on this object is observable, and aimed to call styleApplier on objects(re-render)
   */
  state?: {
    initialState: State;
  };
  /**
   * Static settings, i.e.
   * {
   *     colorScales: {
   *         24: ['', '', '']
   *         16: ['', '', '']
   *     }
   * }
   */
  settings?: Record<string, Settings>;
  /**
   * apply groupings by default
   */
  defaultApplications?: {
    fields: Array<string>;
    // conditions: [{ condition: '>', value: 1 }]
    orders: Array<Order>;
  };
  /**
   * styleApplier aimed to calculate visual properties for the object by calculating group
   * @param object
   * @param group - applied group - for now its a array implemented LinkedList with only root ['hash1']
   * @param state -
   * @return {{ [key: string]: unknown }} - the return ed value will be spread inside object's styles property
   */
  styleApplier: StyleApplierCallback<State>;

  // variant: 'structured' | 'joined'
  axisComponent?: Function;
};

function createGrouping(config: GroupingConfig<unknown & object, any>) {
  const {
    name,
    component,
    styleApplier,
    axisComponent,
    state = { initialState: {} },
    settings = {},
    defaultApplications = null,
  } = config;

  const observableState = createSliceState(
    state.initialState,
    `groupings.${name}`,
  );

  return {
    settings,
    component,
    styleApplier,
    axisComponent,
    observableState,
    defaultApplications,
  };
}

export type GroupingConfigs = Record<
  string,
  Omit<GroupingConfig<unknown & object, any>, 'name'>
>;

function createGroupingsEngine(config: GroupingConfigs, store: any) {
  const groupingSliceConfig: Record<string, any> = {};

  Object.keys(config).forEach((name: string) => {
    groupingSliceConfig[name] = createGrouping({
      name,
      ...config[name],
    });
  });

  const styleAppliers = Object.keys(config || {}).map((key: string) => {
    return config?.[key].styleApplier;
  });

  const state = createGroupingsSlice(groupingSliceConfig);

  const methods = state.generateMethods(store.setState, store.getState);

  const slicesResetMethods: Function[] = [];

  const slices = Object.keys(state.slices).reduce(
    (acc: { [key: string]: object }, name: string) => {
      const elem = state.slices[name];
      const methods = elem.methods(store.setState, store.getState);
      slicesResetMethods.push(methods);
      acc[name] = {
        ...omit(elem, ['styleApplier']),
        ...elem.methods(store.setState, store.getState),
      };
      return acc;
    },
    {},
  );

  function resetSlices() {
    slicesResetMethods.forEach((func) => {
      func();
    });
  }

  return {
    state: { groupings: state.initialState },
    engine: {
      ...omit(state, ['initialState', 'generateMethods', 'slices']),
      ...methods,
      ...slices,
      resetSlices,
      styleAppliers,
    },
  };
}

export default createGroupingsEngine;
