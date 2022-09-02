import { IRunProgressObject } from 'modules/core/api/runsApi';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { GetState, SetState } from 'utils/store/createSlice';

import { IQueryableData, Order, PipelinePhasesEnum } from '../pipeline';

import { GroupingConfigs } from './store/grouping';
import { ControlsConfigs } from './store/controls';
import { IInstructionsState } from './store/instructionsSlice';

export interface ProgressState extends IRunProgressObject {
  percent: number;
}
/*
export const engineStoreReservedSliceKeys = {
  initialized: 'initialized',
  instructions: 'instructions',
  groupings: 'groupings',
  pipeline: 'pipeline',
  query: 'query',
  box: 'box',
};*/

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

export type ExplorerState = {
  initialized: boolean;
  instructions: IInstructionsState | object;
  sequenceName: SequenceTypesEnum | null;
  pipeline: {
    currentPhase: PipelinePhasesEnum;
    status: PipelineStatusEnum;
    progress?: ProgressState;
  };
  groupings?: {
    [key: string]: {
      orders: Order[];
      fields: string[];
    };
    // @ts-ignore
    currentValues: {
      [key: string]: {
        orders: Order[];
        fields: string[];
      };
    };
  };
  data: any;
  additionalData: any;
  foundGroups: any; // remove this
  queryableData: IQueryableData;
};

export type ExplorerConfig = {
  sequenceName: SequenceTypesEnum;
  objectDepth: AimObjectDepths;
  useCache: boolean;
};

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
  /**
   * Executed query but processing
   */
  Processing = 'Processing',
}
