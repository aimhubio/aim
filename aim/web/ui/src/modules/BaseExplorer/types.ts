import React from 'react';

import { GroupType } from 'modules/BaseExplorerCore/pipeline/grouping/types';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { GroupingConfigs } from '../BaseExplorerCore/core-store/grouping';

export interface IExplorerConfig {
  /**
   * The name of explorer, used to identify user configuration for the explorer
   * Since it is identifier, it should be a unique
   */
  readonly explorerName: string;

  /**
   * Engine configuration
   * You can customize grouping behaviours, style appliers etc.
   */
  readonly engine: IEngineConfig;
  /**
   * Configurations for UI
   */
  readonly ui: IUIConfig;

  /**
   * additional states
   */
  readonly states?: IEngineStates;
}

export interface IEngineStates {
  [key: string]: {
    initialState: Record<string, any>;
  };
}

export interface IOptionalEngineConfig {
  useCache?: boolean;
  sequenceName: SequenceTypesEnum;
  adapter: {
    depth: AimObjectDepths;
    objectCreator?: () => any;
  };
  grouping?: {
    [key: string]: {
      type: GroupType;
    };
  };
}

export type IEngineConfig = {
  useCache: boolean;
  sequenceName: SequenceTypesEnum;
  adapter: {
    objectDepth: AimObjectDepths;
    objectCreator?: () => any;
  };
  grouping?: GroupingConfigs;
};

export type styleApplier = (object: any, currentConfig: any, group: any) => any;

export type IUIConfig = {
  defaultBoxConfig: {
    width: number;
    height: number;
    gap: number;
  };
  // will store them, and will create selector to use data and function to update data
  visualizationConfig?: object;
  styleAppliers: {
    // accept generic type and use T in UsedGroupsEnum
    [key: string]: styleApplier;
  };

  components: {
    queryForm: React.FunctionComponent<IQueryFormProps>;
    grouping: React.FunctionComponent<IGroupingProps>;
    visualizations: React.FunctionComponent<IVisualization>[];
    box: React.FunctionComponent<IBoxProps>;
  };
};

export interface IQueryFormProps extends IBaseComponentProps {
  hasAdvancedMode?: boolean;
}
export interface IGroupingProps extends IBaseComponentProps {}
export interface IVisualization extends IBaseComponentProps {}
export interface IBoxProps extends IBaseComponentProps {}

export interface IOptionalExplorerConfig {}

export interface IBaseExplorerProps extends IExplorerConfig {
  engineInstance: any;
}

export interface IBaseComponentProps {
  engine: any;
  // dataSelector: () => any;
}
