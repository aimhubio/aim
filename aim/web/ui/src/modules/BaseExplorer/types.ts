import React from 'react';

import { GroupType } from 'modules/core/pipeline';
import { GroupingConfigs } from 'modules/core/engine/store/grouping';
import { ControlsConfigs } from 'modules/core/engine/store/controls';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

export interface IExplorerConfig {
  /**
   * The name of explorer, used to identify user configuration for the explorer
   * Since it is identifier, it should be a unique
   */
  readonly explorerName: string;

  /**
   * The link to docs
   */
  readonly documentationLink: string;

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
  controls?: ControlsConfigs;
};

export type StyleApplier = (object: any, currentConfig: any, group: any) => any;

export type IUIConfig = {
  defaultBoxConfig: {
    width: number;
    height: number;
    gap: number;
  };
  // will store them, and will create selector to use data and function to update data
  visualizationConfig?: object;
  components: IUIComponents;
};

export interface IUIComponents {
  queryForm: React.FunctionComponent<IQueryFormProps>;
  grouping: React.FunctionComponent<IGroupingProps>;
  visualizations: React.FunctionComponent<IVisualizationProps>[];
  box: React.FunctionComponent<IBoxProps>;
  controls: React.FunctionComponent<IControlsProps>;
}

export interface IQueryFormProps extends IBaseComponentProps {
  hasAdvancedMode?: boolean;
}
export interface IGroupingProps extends IBaseComponentProps {}
export interface IControlsProps extends IBaseComponentProps {}

export interface IVisualizationsProps extends IBaseComponentProps {
  components: IUIComponents;
}

export interface IVisualizationProps extends IBaseComponentProps {
  box?: React.FunctionComponent<IBoxProps>;
  panelRenderer: () => React.ReactNode;
}

export interface IProgressBarProps extends IBaseComponentProps {}

export interface IBoxProps extends IBaseComponentProps {
  data: any;
  style?: React.CSSProperties;
}

export interface IOptionalExplorerConfig {}
export interface IExplorerBarProps extends IBaseComponentProps {
  explorerName: string;
  documentationLink: string;
}
export interface IBaseExplorerProps extends IExplorerConfig {
  engineInstance: any;
  explorerName: string;
  documentationLink: string;
}

export interface IBaseComponentProps {
  engine: any;
  // dataSelector: () => any;
}
