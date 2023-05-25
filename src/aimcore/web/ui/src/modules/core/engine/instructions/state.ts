import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import {
  GetProjectsInfoResult,
  GetProjectsInfoSequencesResult,
} from 'modules/core/api/projectApi';
import { AimErrorType, SelectorCreator } from 'modules/core/engine/types';

import { SequenceType } from 'types/core/enums';

type Status = {
  isLoading: boolean;
  error: AimErrorType | null;
};

/**
 * the state type useful for initial data for explorer
 */
export interface IInstructionsState<SequenceName extends SequenceType> {
  status: Status;
  /**
   * queryable data
   */
  project_params_info: GetProjectsInfoSequencesResult | null;
  /**
   * select_form data
   */
  project_sequence_info: GetProjectsInfoSequencesResult[SequenceName] | null;
}

type ExtractState<TStore, SequenceName extends SequenceType> = {
  instructions: IInstructionsState<SequenceName>;
} & TStore;

type Selectors<T, SequenceName extends SequenceType> = {
  paramsInfoSelector: SelectorCreator<T, GetProjectsInfoSequencesResult | null>;
  sequenceInfoSelector: SelectorCreator<
    T,
    GetProjectsInfoSequencesResult[SequenceName] | null
  >;
  statusSelector: SelectorCreator<T, Status>;
  stateSelector: SelectorCreator<T, QueryableInfo<SequenceName>>;
};

export type InstructionsStateBridge<
  TStore,
  SequenceName extends SequenceType,
> = {
  initialState: IInstructionsState<SequenceName>;
  setInfo: (
    params_info: GetProjectsInfoSequencesResult,
    sequence_info: GetProjectsInfoSequencesResult[SequenceName],
  ) => void;
  setError: (error: AimErrorType | null) => void;
  getStatus: () => Status;
  getParamsInfo: () => GetProjectsInfoSequencesResult | null;
} & {
  selectors: Selectors<ExtractState<TStore, SequenceName>, SequenceName>;
};

type QueryableInfo<SequenceName extends SequenceType> = {
  queryable_data: GetProjectsInfoSequencesResult | null;
  project_sequence_info: GetProjectsInfoSequencesResult[SequenceName] | null;
};

function createState<TStore, SequenceName extends SequenceType>(
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
    ): GetProjectsInfoSequencesResult | null =>
      state.instructions.project_params_info,
    sequenceInfoSelector: (
      state: ExtractState<TStore, SequenceName>,
    ): GetProjectsInfoSequencesResult[SequenceName] | null =>
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
      params_info: GetProjectsInfoSequencesResult,
      sequence_info: GetProjectsInfoSequencesResult[SequenceName],
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
