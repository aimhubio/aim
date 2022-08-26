import { StoreApi } from 'zustand';
import produce, { Draft } from 'immer';

import { Order, PipelinePhasesEnum } from 'modules/core/pipeline';
import { RunsSearchQueryParams } from 'modules/core/api/runsApi';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { PipelineStatusEnum, ProgressState } from '../types';

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

export interface IPipelineState<TObject> {
  currentPhase: PipelinePhasesEnum;
  currentGrouping: CurrentGrouping;
  additionalData: AdditionalData;
  queryableData: QueryableData;
  currentQuery: CurrentQuery;
  status: PipelineStatusEnum;
  foundGroups: FoundGroups;
  progress: ProgressState;
  data: FlatList<TObject>;
}

type SelectorCreator<TState, P> = (state: TState) => P;

type Selectors<TState, TObject> = {
  additionalDataSelector: SelectorCreator<TState, AdditionalData>;
  queryableDataSelector: SelectorCreator<TState, QueryableData>;
  foundGroupsSelector: SelectorCreator<TState, FoundGroups>;
  dataSelector: SelectorCreator<TState, FlatList<TObject>>;
  currentQuerySelector: SelectorCreator<TState, CurrentQuery>;
  currentGroupingSelector: SelectorCreator<TState, CurrentGrouping>;
};

export type PipelineStateBridge<TObject> = {
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

function createState<TStore, TObject>(
  store: StoreApi<ExtractState<TStore, TObject>>,
  initialState: IPipelineState<TObject> = {
    status: PipelineStatusEnum.NeverExecuted,
    currentPhase: PipelinePhasesEnum.Waiting,
    progress: initialProgressState,
    additionalData: {
      modifiers: [],
      params: [],
    },
    queryableData: {},
    currentQuery: {},
    currentGrouping: {},
    data: [],
    foundGroups: {},
  },
): PipelineStateBridge<TObject> & {
  selectors: Selectors<ExtractState<TStore, TObject>, TObject>;
} {
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
    ): CurrentGrouping => state.pipeline.currentGrouping,
  };

  const methods: Omit<PipelineStateBridge<TObject>, 'initialState'> = {
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
      );
    },
    setCurrentQuery: (query: CurrentQuery) =>
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.currentQuery = query;
          },
        ),
      ),
    setCurrentGroupings: (grouping: CurrentGrouping) =>
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.currentGrouping = grouping;
          },
        ),
      ),
    getCurrentQuery: (): CurrentQuery => store.getState().pipeline.currentQuery,
    getCurrentGroupings: (): CurrentGrouping =>
      store.getState().pipeline.currentGrouping,
    setProgress: (progress: ProgressState) => {
      store.setState(
        produce<ExtractState<TStore, TObject>>(
          (draft_state: Draft<ExtractState<TStore, TObject>>) => {
            draft_state.pipeline.progress = progress;
          },
        ),
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
            if (queryableData) {
              draft_state.pipeline.queryableData = queryableData;
            }
          },
        ),
      ),
  };

  return {
    initialState,
    selectors,
    ...methods,
  };
}

export default createState;
