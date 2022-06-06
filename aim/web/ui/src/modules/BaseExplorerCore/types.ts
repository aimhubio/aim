import { GetState, SetState } from 'utils/store/createSlice';

export const engineStoreReservedSliceKeys = {
  initialized: 'initialized',
  instructions: 'instructions',
  groupings: 'groupings',
  pipeline: 'pipeline',
  query: 'query',
  box: 'box',
};

export type EngineStoreReservedSliceKeys =
  | 'initialized'
  | 'instructions'
  | 'groupings'
  | 'pipeline'
  | 'query'
  | 'box';

export type SliceCreationConfig<TSliceState> = {
  initialState: TSliceState;
};

export type StoreSliceCreator<TSliceState> = {
  [key: string]: SliceCreationConfig<TSliceState>;
};

interface StoreSliceMethods<T> {
  update: (store: T) => void;
  reset(): void;
}

export type StoreSlice<TStore, TSliceState> = {
  readonly initialState: TSliceState;
  readonly methods: StoreSliceMethods<TStore>;
  readonly dataSelector: (store: TStore) => TSliceState;
};

export type GenerateStoreMethods = <T>(
  setState: SetState<T>,
  getState: GetState<T>,
) => StoreSliceMethods<T>;

export type CreateStoreSlice = <TStore, TSliceState>(
  initialState: TSliceState,
) => StoreSlice<TStore, TSliceState>;
