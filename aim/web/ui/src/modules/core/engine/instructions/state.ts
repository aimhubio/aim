import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import { GetParamsResult } from 'modules/core/api/projectApi';
import { AimErrorType, SelectorCreator } from 'modules/core/engine/types';

import { SequenceTypesEnum } from 'types/core/enums';

type Status = {
  isLoading: boolean;
  error: AimErrorType | null;
};

/**
 * the state type useful for initial data for explorer
 */
export interface IInstructionsState<SequenceName extends SequenceTypesEnum> {
  status: Status;
  /**
   * queryable data
   */
  project_params_info: GetParamsResult | null;
  /**
   * select_form data
   */
  project_sequence_info: GetParamsResult[SequenceName] | null;
}

type ExtractState<TStore, SequenceName extends SequenceTypesEnum> = {
  instructions: IInstructionsState<SequenceName>;
} & TStore;

type Selectors<T, SequenceName extends SequenceTypesEnum> = {
  paramsInfoSelector: SelectorCreator<T, GetParamsResult | null>;
  sequenceInfoSelector: SelectorCreator<
    T,
    GetParamsResult[SequenceName] | null
  >;
  statusSelector: SelectorCreator<T, Status>;
  stateSelector: SelectorCreator<T, QueryableInfo<SequenceName>>;
};

export type InstructionsStateBridge<
  TStore,
  SequenceName extends SequenceTypesEnum,
> = {
  initialState: IInstructionsState<SequenceName>;
  setInfo: (
    params_info: GetParamsResult,
    sequence_info: GetParamsResult[SequenceName],
  ) => void;
  setError: (error: AimErrorType | null) => void;
  getStatus: () => Status;
  getParamsInfo: () => GetParamsResult | null;
} & {
  selectors: Selectors<ExtractState<TStore, SequenceName>, SequenceName>;
};

type QueryableInfo<SequenceName extends SequenceTypesEnum> = {
  queryable_data: GetParamsResult | null;
  project_sequence_info: GetParamsResult[SequenceName] | null;
};

function createState<TStore, SequenceName extends SequenceTypesEnum>(
  store: StoreApi<ExtractState<TStore, SequenceName>>,
  initialState: IInstructionsState<SequenceName> = {
    status: {
      isLoading: true,
      error: null,
    },
    project_params_info: null,
    project_sequence_info: null,
  },
): InstructionsStateBridge<TStore, SequenceName> {
  type Store = ExtractState<TStore, SequenceName>;

  const selectors: Selectors<
    ExtractState<TStore, SequenceName>,
    SequenceName
  > = {
    paramsInfoSelector: (
      state: ExtractState<TStore, SequenceName>,
    ): GetParamsResult | null => state.instructions.project_params_info,
    sequenceInfoSelector: (
      state: ExtractState<TStore, SequenceName>,
    ): GetParamsResult[SequenceName] | null =>
      state.instructions.project_sequence_info,
    statusSelector: (state: ExtractState<TStore, SequenceName>): Status =>
      state.instructions.status,
    stateSelector: (
      state: ExtractState<TStore, SequenceName>,
    ): QueryableInfo<SequenceName> => ({
      queryable_data: state.instructions.project_params_info,
      project_sequence_info: state.instructions.project_sequence_info,
    }),
  };

  const methods: Omit<
    InstructionsStateBridge<TStore, SequenceName>,
    'selectors' | 'initialState'
  > = {
    setInfo: (
      params_info: GetParamsResult,
      sequence_info: GetParamsResult[SequenceName],
    ): void => {
      store.setState(
        produce<Store>((draft_state: Draft<Store>) => {
          // @ts-ignore
          draft_state.instructions.project_sequence_info = sequence_info;
          draft_state.instructions.project_params_info = params_info;
          draft_state.instructions.status.isLoading = false;
        }),
        false,
        // @ts-ignore
        '@PROJECTS/setInfo',
      );
    },
    setError: (error: AimErrorType | null = null): void => {
      store.setState(
        produce<Store>((draft_state: Draft<Store>) => {
          draft_state.instructions.status.isLoading = false;
          draft_state.instructions.status.error = error;
        }),
      );
    },
    getStatus: () => store.getState().instructions.status,
    getParamsInfo: () => store.getState().instructions.project_params_info,
  };

  return {
    initialState,
    selectors,
    ...methods,
  };
}

export default createState;
