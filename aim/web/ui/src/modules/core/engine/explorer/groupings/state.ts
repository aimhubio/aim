import { omit } from 'lodash-es';

import { Order } from 'modules/core/pipeline';

import { StatePersistOption } from '../../types';

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
    persist?: StatePersistOption;
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
   * @param group - applied group - for now it's an array implemented LinkedList with only root ['hash1']
   * @param state -
   * @return {{ [key: string]: unknown }} - the return ed value will be spread inside object's styles property
   */
  styleApplier: StyleApplierCallback<State>;
};

function getCurrentValues(
  defaultValues: {
    orders: Order[];
    fields: string[];
  } = {
    orders: [],
    fields: [],
  },
): {
  orders: Order[];
  fields: string[];
} {
  if (!defaultValues) {
    return {
      fields: [],
      orders: [],
    };
  }

  if (!defaultValues.orders) {
    defaultValues.orders = [];
  }

  if (!defaultValues.fields) {
    defaultValues.fields = [];
  }

  const lengthsDiff = defaultValues.orders.length - defaultValues.fields.length;

  if (lengthsDiff === 0) {
    return defaultValues;
  }

  if (lengthsDiff > 0) {
    return {
      fields: defaultValues.fields,
      orders: defaultValues.orders.slice(0, defaultValues.fields.length),
    };
  }

  const orders = defaultValues.orders.concat(
    new Array(-lengthsDiff).fill(Order.ASC),
  );

  return {
    fields: defaultValues.fields,
    orders: orders,
  };
}

function createGroupingsSlice(slices: Record<string, any>) {
  let initialState: Record<string, any> = {
    currentValues: {},
    isEmpty: true,
  };
  const subSlices: Record<string, any> = {};

  Object.keys(slices).forEach((name) => {
    const slice = slices[name];
    const defaultValues = getCurrentValues(slice.defaultApplications);

    initialState = {
      ...initialState,
      [name]: slice.observableState.initialState,
      currentValues: {
        ...initialState.currentValues,
        [name]: defaultValues,
      },
      isEmpty: defaultValues.fields.length === 0,
    };
    subSlices[name] = {
      ...omit(slice, 'observableState'),
      ...slice.observableState,
    };
  });

  function generateMethods(set: Function, get: Function) {
    const update = (
      groupValues: Record<
        string,
        { orders: Order[]; fields: string[]; isApplied: boolean }
      >,
    ) => {
      const store = get().groupings;
      let isEmpty = true;
      const newValues = Object.keys(groupValues).reduce(
        (
          acc: Record<
            string,
            { orders: Order[]; fields: string[]; isApplied: boolean }
          >,
          name: string,
        ) => {
          acc[name] = {
            ...getCurrentValues(groupValues[name]),
            isApplied: groupValues[name].isApplied,
          };

          if (acc[name].fields.length > 0) {
            isEmpty = false;
          }
          return acc;
        },
        {},
      );

      set(
        {
          groupings: {
            ...store,
            currentValues: newValues,
            isEmpty,
          },
        },
        false,
        '@UPDATE/GROUPING',
      );
    };
    const reset = () => {
      const store = get().groupings;
      let isEmpty = true;
      const newValues = Object.keys(store.currentValues).reduce(
        (
          acc: Record<string, { orders: Order[]; fields: string[] }>,
          name: string,
        ) => {
          acc[name] = slices[name].defaultApplications;
          if (acc[name].fields.length > 0) {
            isEmpty = false;
          }
          return acc;
        },
        {},
      );
      set(
        {
          groupings: {
            ...store,
            currentValues: newValues,
            isEmpty,
          },
        },
        false,
        '@RESET/GROUPING',
      );
    };
    return {
      update,
      reset,
    };
  }

  return {
    initialState,
    stateSelector: (state: any) =>
      omit(state.groupings, 'currentValues', 'isEmpty'),
    generateMethods,
    slices: subSlices,
    currentValuesSelector: (state: any) => state.groupings.currentValues,
    isEmptySelector: (state: any) => state.groupings.isEmpty,
  };
}

export default createGroupingsSlice;
