import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import { GetParamsResult } from 'modules/core/api/projectApi';
import { SelectorCreator } from 'modules/core/engine/types';

import { SequenceTypesEnum } from 'types/core/enums';

type Status = {
  isLoading: boolean;
  error: string | null;
};

export interface IInstructionsState<SequenceName extends SequenceTypesEnum> {
  status: Status;
  project_params_info: GetParamsResult | null;
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
  setError: (error: string | null) => void;
} & {
  selectors: Selectors<ExtractState<TStore, SequenceName>, SequenceName>;
};

function createState<TStore, SequenceName extends SequenceTypesEnum>(
  store: StoreApi<ExtractState<TStore, SequenceName>>,
  initialState: IInstructionsState<SequenceName> = {
    status: {
      isLoading: false,
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
      );
    },
    setError: (error: string | null = null): void => {
      store.setState(
        produce<Store>((draft_state: Draft<Store>) => {
          draft_state.instructions.status.isLoading = false;
          draft_state.instructions.status.error = error;
        }),
      );
    },
  };

  return {
    initialState,
    selectors,
    ...methods,
  };
}

export default createState;
