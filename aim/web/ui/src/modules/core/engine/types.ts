import { IRunProgressObject } from 'modules/core/api/runsApi';
import { CustomStates } from 'modules/core/utils/store';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { GetState, SetState } from 'utils/store/createSlice';

import { GroupingConfigs } from './explorer/groupings';
import { ControlsConfigs } from './visualizations/controls';

export interface ProgressState extends IRunProgressObject {
  percent: number;
}

export type EngineStoreReservedSliceKeys =
  | 'instructions'
  | 'groupings'
  | 'pipeline'
  | 'query'
  | 'visualizations'
  | 'controls'
  | 'states';

export type SliceCreationConfig<TSliceState> = {
  initialState: TSliceState;
};

export type StoreSliceCreator<TSliceState> = {
  [key: string]: SliceCreationConfig<TSliceState>;
};

export interface StoreSliceMethods {
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
  states?: CustomStates;
}

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
  Never_Executed = 'Never Executed',
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

export type SelectorCreator<TState, P> = (state: TState) => P;

export interface AimErrorType {
  name: string;
  message: string;
  detail: Record<string, any>;
}

export interface PipelineErrorType extends AimErrorType {
  source: string;
}

export type PersistenceFunction = () => void;
export enum PersistenceTypesEnum {
  Url = 'url',
  LocalStorage = 'localStorage',
}

export type StatePersistOption =
  | `${PersistenceTypesEnum}`
  | PersistenceFunction;

export interface INotificationItem {
  id: string;
  messages: string[];
  title?: string;
  style?: {};
  iconName?: string;
  duration?: number;
}
export interface INotificationsState {
  data: INotificationItem[];
}

export type ExtractState<T, S> = S & T;
