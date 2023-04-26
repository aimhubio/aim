import { isEmpty, omit } from 'lodash-es';

import browserHistory from 'modules/core/services/browserHistory';
import { GroupType, Order } from 'modules/core/pipeline';
import { createSliceState } from 'modules/core/utils/store';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import setStatePersistence from 'modules/core/utils/setStatePersistence';

import {
  PersistenceTypesEnum,
  StatePersistOption,
  StoreSliceMethods,
} from '../../types';

import createGroupingsSlice from './state';

export interface StyleApplierCallbackArgs<S extends object> {
  object: any;
  groupInfo: Record<GroupType, any>;
  boxConfig: any;
  state: S;
}

export type StyleApplierCallback<S extends object> = (
  args: StyleApplierCallbackArgs<S>,
) => Record<string, unknown>;

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
    persist?: PersistenceTypesEnum;
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
    isApplied: boolean;
  };
  /**
   * styleApplier aimed to calculate visual properties for the object by calculating group
   * @param object
   * @param group - applied group - for now it's an array implemented LinkedList with only root ['hash1']
   * @param state -
   * @return {{ [key: string]: unknown }} - the return ed value will be spread inside object's styles property
   */
  styleApplier: StyleApplierCallback<State>;
};

function createGrouping(config: GroupingConfig<unknown & object, any>) {
  const {
    name,
    component,
    styleApplier,
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
    observableState,
    defaultApplications,
  };
}

export type GroupingConfigs = Record<
  string,
  Omit<GroupingConfig<unknown & object, any>, 'name'>
>;

type GroupValues = Record<
  string,
  { orders: Order[]; fields: string[]; isApplied: boolean }
>;

function createGroupingsEngine(
  config: GroupingConfigs,
  store: any,
  persist?: boolean, // TODO later use StatePersistOption,
) {
  const groupingSliceConfig: Record<string, any> = {};

  Object.keys(config).forEach((name: string) => {
    groupingSliceConfig[name] = createGrouping({
      name,
      ...config[name],
    });
  });

  const styleAppliers = Object.keys(groupingSliceConfig || {}).map(
    (key: string) => {
      return groupingSliceConfig?.[key].styleApplier;
    },
  );

  const state = createGroupingsSlice(groupingSliceConfig);

  const methods = state.generateMethods(store.setState, store.getState);

  const stateResetMethods: Function[] = [];
  const facetStateResetMethods: Function[] = [];
  const initializers: Function[] = [];

  initializers.push(
    createInitializer(
      'groupings',
      methods.update,
      methods.reset,
      PersistenceTypesEnum.Url,
    ),
  );

  const slices = Object.keys(state.slices).reduce(
    (acc: Record<string, any>, name: string) => {
      const elem = state.slices[name];
      const originalMethods = elem.methods(store.setState, store.getState);
      stateResetMethods.push(originalMethods.reset);
      if (elem.settings.facet) {
        facetStateResetMethods.push(originalMethods.reset);
      }

      const persistenceKey = ['gr', name].join('-');
      const persistenceType = config[name].state?.persist;
      const overrideMethods = setStatePersistence(
        persistenceKey,
        persistenceType as PersistenceTypesEnum,
        originalMethods,
      );

      acc[name] = {
        ...omit(elem, ['styleApplier']),
        ...overrideMethods,
        methods: overrideMethods,
      };

      initializers.push(
        createInitializer(
          persistenceKey,
          originalMethods.update,
          originalMethods.reset,
          persistenceType,
        ),
      );
      return acc;
    },
    {},
  );

  /**
   * Initialize grouping states
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
    return (): Function => {
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

  function update(groupValues: GroupValues) {
    methods.update(groupValues);
  }

  function resetState() {
    stateResetMethods.forEach((func) => func());
  }

  function resetFacetState() {
    facetStateResetMethods.forEach((func) => func());
  }

  function initialize() {
    if (persist) {
      const finalizers: Function[] = [];
      // call initializers
      initializers.forEach((init) => {
        const finalizer = init();
        finalizers.push(finalizer);
      });

      return () => {
        // call finalizers
        finalizers.forEach((finalizer) => finalizer());
      };
    }

    return () => {};
  }

  return {
    state: { groupings: state.initialState },
    engine: {
      ...omit(state, ['initialState', 'generateMethods', 'slices']),
      reset: methods.reset,
      update,
      ...slices,
      resetState,
      resetFacetState,
      styleAppliers,
      initialize,
    },
  };
}

export default createGroupingsEngine;
