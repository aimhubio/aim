import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import { Order, PipelinePhasesEnum } from 'modules/core/pipeline';
import { RunsSearchQueryParams } from 'modules/core/api/runsApi';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { PipelineErrorType, PipelineStatusEnum, ProgressState } from '../types';

export type AdditionalData = {
  modifiers: string[];
  params: string[];
};

export type CurrentGrouping = {
  [key: string]: {
    orders: Order[];
    fields: string[];
  };
};

export type CurrentQuery = RunsSearchQueryParams;
export type QueryableData = {};
export type FlatList<TObject> = AimFlatObjectBase<TObject>[];
export type FoundGroups = {};
export type PipelineErrorState = PipelineErrorType | null;

export interface IPipelineState<TObject> {
  currentPhase: PipelinePhasesEnum;
  currentGroupings: CurrentGrouping;
  additionalData: AdditionalData;
  queryableData: QueryableData;
  currentQuery: CurrentQuery;
  status: PipelineStatusEnum;
  foundGroups: FoundGroups;
  progress: ProgressState;
  data: FlatList<TObject>;
  error: PipelineErrorState;
}

type SelectorCreator<TState, P> = (state: TState) => P;

type Selectors<TState, TObject> = {
  additionalDataSelector: SelectorCreator<TState, AdditionalData>;
  queryableDataSelector: SelectorCreator<TState, QueryableData>;
  foundGroupsSelector: SelectorCreator<TState, FoundGroups>;
  dataSelector: SelectorCreator<TState, FlatList<TObject>>;
  currentQuerySelector: SelectorCreator<TState, CurrentQuery>;
  currentGroupingSelector: SelectorCreator<TState, CurrentGrouping>;
  statusSelector: SelectorCreator<TState, PipelineStatusEnum>;
  progressSelector: SelectorCreator<TState, ProgressState>;
  errorSelector: SelectorCreator<TState, PipelineErrorState>;
};

export type PipelineStateBridge<TObject, TStore> = {
  initialState: IPipelineState<TObject>;
  getCurrentQuery: () => CurrentQuery;
  setCurrentQuery: (query: CurrentQuery) => void;
  setCurrentGroupings: (groupings: CurrentGrouping) => void;
  getCurrentGroupings: () => CurrentGrouping;
  setResult: (
    data: FlatList<TObject>,
    foundGroups: FoundGroups,
    additionalData: AdditionalData,
    queryableData?: QueryableData,
  ) => void;
  changeCurrentPhaseOrStatus: (
    status: PipelineStatusEnum,
    phase?: PipelinePhasesEnum,
  ) => void;
  getCurrentPhase: () => PipelinePhasesEnum;
  getStatus: () => PipelineStatusEnum;
  setProgress: (progress: ProgressState) => void;
  resetProgress: () => void;
  setError: (error: PipelineErrorState) => void;
} & {
  selectors: Selectors<ExtractState<TStore, TObject>, TObject>;
};
type ExtractState<TStore, TObject> = {
  pipeline: IPipelineState<TObject>;
} & TStore;

const initialProgressState: ProgressState = {
  matched: 0,
  trackedRuns: 0,
  percent: 0,
  checked: 0,
};

function getInitialState<TObject>(): IPipelineState<TObject> {
  const initialState: IPipelineState<TObject> = {
    status: PipelineStatusEnum.Never_Executed,
    currentPhase: PipelinePhasesEnum.Waiting,
    progress: initialProgressState,
    additionalData: {
      modifiers: [],
      params: [],
    },
    queryableData: {},
    currentQuery: {},
    currentGroupings: {},
    data: [],
    foundGroups: {},
    error: null,
  };

  return initialState;
}

function createState<TStore, TObject>(
  store: StoreApi<ExtractState<TStore, TObject>>,
  initialState: IPipelineState<TObject> = getInitialState<TObject>(),
): PipelineStateBridge<TObject, TStore> {
  const selectors: Selectors<ExtractState<TStore, TObject>, TObject> = {
    additionalDataSelector: (
      state: ExtractState<TStore, TObject>,
    ): AdditionalData => state.pipeline.additionalData,
    queryableDataSelector: (
      state: ExtractState<TStore, TObject>,
    ): QueryableData => state.pipeline.queryableData,

    // result
    foundGroupsSelector: (state: ExtractState<TStore, TObject>): FoundGroups =>
      state.pipeline.foundGroups,
    dataSelector: (state: ExtractState<TStore, TObject>): FlatList<TObject> =>
      state.pipeline.data,
    currentQuerySelector: (
      state: ExtractState<TStore, TObject>,
    ): CurrentQuery => state.pipeline.currentQuery,
    currentGroupingSelector: (
      state: ExtractState<TStore, TObject>,
    ): CurrentGrouping => state.pipeline.currentGroupings,
    statusSelector: (
      state: ExtractState<TStore, TObject>,
    ): PipelineStatusEnum => state.pipeline.status,
    progressSelector: (state: ExtractState<TStore, TObject>): ProgressState =>
      state.pipeline.progress,
    errorSelector: (state: ExtractState<TStore, TObject>): PipelineErrorState =>
      state.pipeline.error,
  };

  const methods: Omit<
    PipelineStateBridge<TObject, TStore>,
    'initialState' | 'selectors'
  > = {
    getStatus: () => store.getState().pipeline.status,
    getCurrentPhase: () => store.getState().pipeline.currentPhase,
    changeCurrentPhaseOrStatus: (
      status: PipelineStatusEnum,
      phase?: PipelinePhasesEnum,
    ) => {
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.status = status;
            if (phase) {
              draft_state.pipeline.currentPhase = phase;
            }
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/CHANGE_CURRENT_STEP_OR_STATUS',
      );
    },
    setCurrentQuery: (query: CurrentQuery) =>
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.currentQuery = query;
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/SET_CURRENT_QUERY',
      ),
    setCurrentGroupings: (grouping: CurrentGrouping) =>
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.currentGroupings = grouping;
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/SET_CURRENT_GROUPINGS',
      ),
    getCurrentQuery: (): CurrentQuery => store.getState().pipeline.currentQuery,
    getCurrentGroupings: (): CurrentGrouping =>
      store.getState().pipeline.currentGroupings,
    setProgress: (progress: ProgressState) => {
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.progress = progress;
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/SET_PROGRESS',
      );
    },
    resetProgress: () => {
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.progress = initialProgressState;
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/RESET_PROGRESS',
      );
    },
    setResult: (
      data: FlatList<TObject>,
      foundGroups: FoundGroups,
      additionalData: AdditionalData,
      queryableData?: QueryableData,
    ): void =>
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.additionalData = additionalData;
            draft_state.pipeline.foundGroups = foundGroups;
            draft_state.pipeline.data = data as FlatList<Draft<TObject>>;
            draft_state.pipeline.error = null;
            if (queryableData) {
              draft_state.pipeline.queryableData = queryableData;
            }
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/setResult',
      ),
    setError: (error: PipelineErrorState) => {
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.error = error;
          },
        ),
        false,
        // @ts-ignore
        '@PIPELINE/setError',
      );
    },
  };

  return {
    initialState,
    selectors,
    ...methods,
  };
}

export { getInitialState };
export default createState;
