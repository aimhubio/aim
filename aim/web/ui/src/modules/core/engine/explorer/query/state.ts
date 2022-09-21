import { StoreApi } from 'zustand';
import { omit } from 'lodash-es';

import { createSliceState, StateSlice } from 'modules/core/utils/store';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';

export type QueryFormState = {
  simpleInput: string;
  advancedInput: string;
  selections: ISelectOption[];
  advancedModeOn: boolean;
};

export type QueryRangesState = {
  isApplyButtonDisabled: boolean;
  isValid: boolean;
};

type ExtractState<TStore> = {
  query: QueryState;
} & TStore;

export type QueryState = {
  form: QueryFormState;
  ranges: QueryRangesState;
};

type QuerySlices<TStore> = {
  form: StateSlice<QueryFormState, ExtractState<TStore>>;
  ranges: StateSlice<QueryRangesState, ExtractState<TStore>>;
};

export type QueryStateBridge<TStore> = {
  initialState: QueryState;
  reset: () => void;
} & QuerySlices<TStore>;

/*
 * Currently designed for default QueryForm component state
 * Later its possible to add custom configuration of query if will be required for custom explorer usage
 */
const queryFormInitialState: QueryFormState = {
  simpleInput: '',
  advancedInput: '',
  selections: [],
  advancedModeOn: false,
};

/*
 * Currently designed for default RangesSlider component state
 * Later its possible to add custom configuration of state if will be required for custom explorer usage
 */
const queryRangesInitialState: QueryRangesState = {
  isApplyButtonDisabled: true,
  isValid: true,
};

export function createState<TStore>(
  store: StoreApi<ExtractState<TStore>>,
): QueryStateBridge<TStore> {
  /*
   * pre-created form slice
   * directly useful from query and has all necessary methods and selector as custom state has
   */
  const form = createSliceState<QueryFormState, ExtractState<TStore>>(
    queryFormInitialState,
    'query.form',
  );

  /*
   * pre-created query slice
   * directly useful from query and has all necessary methods and selector as custom state has
   */
  const ranges = createSliceState<QueryRangesState, ExtractState<TStore>>(
    queryRangesInitialState,
    'query.ranges',
  );

  const initialState: QueryState = {
    form: form.initialState,
    ranges: ranges.initialState,
  };

  const slices: QuerySlices<TStore> = {
    ranges: {
      ...omit(ranges, ['methods']),
      ...ranges.methods(store.setState, store.getState),
    },
    form: {
      ...omit(form, ['methods']),
      ...form.methods(store.setState, store.getState),
    },
  };

  function reset() {
    slices.ranges.reset();
    slices.form.reset();
  }

  return {
    initialState,
    ...slices,
    reset,
  };
}

export default createState;
