import { omit } from 'lodash-es';

import { Order } from 'modules/core/pipeline';

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

function createGroupingsSlice(groupings: Record<string, any>) {
  let initialState: Record<string, any> = {
    currentValues: {},
    isEmpty: true,
  };
  const subSlices: Record<string, any> = {};

  const stateSelector = (state: any) => state.groupings.state;

  Object.keys(groupings).forEach((name) => {
    const group = groupings[name];
    const defaultValues = getCurrentValues(group.defaultApplications);
    initialState = {
      ...initialState,
      [name]: group.observableState.initialState,
      currentValues: {
        ...initialState.currentValues,
        [name]: defaultValues,
      },
    };
    if (defaultValues.fields.length > 0) {
      initialState.isEmpty = false;
    }
    subSlices[name] = {
      ...omit(group, 'observableState'),
      ...group.observableState,
    };
  });

  function generateMethods(set: Function, get: Function) {
    const update = (
      groupValues: Record<string, { orders: Order[]; fields: string[] }>,
    ) => {
      const store = get().groupings.currentValues;
      let isEmpty = true;
      const newValues = Object.keys(groupValues).reduce(
        (
          acc: Record<string, { orders: Order[]; fields: string[] }>,
          name: string,
        ) => {
          acc[name] = getCurrentValues(groupValues[name]);
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
            ...store.groupings,
            currentValues: newValues,
            isEmpty,
          },
        },
        false,
        '@UPDATE/GROUPING',
      );
    };
    const reset = () => {
      const store = get().groupings.currentValues;
      let isEmpty = true;
      const newValues = Object.keys(store).reduce(
        (
          acc: Record<string, { orders: Order[]; fields: string[] }>,
          name: string,
        ) => {
          acc[name] = groupings[name].defaultApplications;
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
            ...store.groupings,
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
    stateSelector,
    generateMethods,
    slices: subSlices,
    currentValuesSelector: (state: any) => state.groupings.currentValues,
    isEmptySelector: (state: any) => state.groupings.isEmpty,
  };
}

export default createGroupingsSlice;
