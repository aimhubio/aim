import { GetState, SetState } from 'utils/store/createSlice';

import { AimObjectDepths, SequenceTypesEnum } from '../../types/core/enums';

import { GroupingConfigs } from './core-store/grouping';
import { ControlsConfigs } from './core-store/controls';

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

interface StoreSliceMethods {
  update: Function;
  reset(): void;
}

export type StoreSlice<TStore, TSliceState> = {
  readonly initialState: TSliceState;
  readonly methods: StoreSliceMethods /*<TStore>*/;
  readonly stateSelector: (store: TStore) => TSliceState;
};

export type GenerateStoreMethods = <T>(
  setState: SetState<T>,
  getState: GetState<T>,
) => StoreSliceMethods /*<T>*/;

export type CreateStoreSlice = <TStore, TSliceState>(
  initialState: TSliceState,
) => StoreSlice<TStore, TSliceState>;

export interface IEngineConfigFinal {
  useCache?: boolean;
  sequenceName: SequenceTypesEnum;
  adapter: {
    objectDepth: AimObjectDepths;
  };
  grouping?: GroupingConfigs;
  controls?: ControlsConfigs;
  defaultBoxConfig: {
    width: number;
    height: number;
    gap: number;
  };
  styleAppliers?: {
    [key: string]: Function;
  };
  states?: {
    [name: string]: {
      initialState: object;
    };
  };
}

export enum PipelineStatusEnum {
  /*
   * There is no tracked data in storage to execute pipeline
   */
  Insufficient_Resources = 'Insufficient Resources',
  /*
   * Never queried
   */
  NeverExecuted = 'Never Executed',
  /*
   * Executing
   */
  Executing = 'Executing',
  /**
   * Successfully executed
   */
  Succeed = 'Succeed',
  /*
   * Executed with failure
   */
  Failed = 'Failed',
  /*
   * Executed but there is no data in pipeline
   */
  Empty = 'Empty',
}
