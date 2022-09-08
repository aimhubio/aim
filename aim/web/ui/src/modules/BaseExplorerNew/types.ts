import React from 'react';

import { GroupType } from 'modules/core/pipeline';
import { GroupingConfigs } from 'modules/core/engine/store/grouping';
import { ControlsConfigs } from 'modules/core/engine/store/controls';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { VisualizationsConfig } from '../core/engine/visualizations';
import { EngineNew } from '../core/engine/engine.new';

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
  controlComponent?: React.FunctionComponent<IControlsProps>;
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

export declare interface ExplorerEngineConfiguration {
  /**
   * Enable/disable pipeline cache
   * @optional
   * @default value is false
   */
  enablePipelineCache?: boolean;

  /**
   * Sequence name
   */
  sequenceName: SequenceTypesEnum;

  /**
   * Pipeline Adapter phase config
   */
  adapter: {
    /**
     * Object depth indicates the depth of the object inside the sequence
     * @example
     *   If sequenceName is Images then the objectDepth should be Index
     */
    objectDepth: AimObjectDepths;
  };
  /**
   * groupings configurations
   * @optional
   * @default value is {}
   */
  groupings?: GroupingConfigs;

  /**
   * Visualizations
   */
  visualizations: ExplorerVisualizationsConfiguration;
}

export declare interface ExplorerVisualizationsConfiguration
  extends VisualizationsConfig {}

export declare interface ExplorerUIComponents {
  /**
   * Query Form component
   * This component will render at the top of the explorer
   * query form allows to query and search sequence data
   * If you want to pass this component, you should manage querying searching for your own
   * @optional
   * @default value is BaseExplorers default BaseQueryForm component
   */
  queryForm?: React.FunctionComponent<IQueryFormProps>;

  /**
   * Grouping item wrappers component
   * This component will render at the top of the explorer
   * query form allows to query and search sequence data
   * If you want to pass this component, you should manage querying searching for your own
   * @optional
   * @default value is BaseExplorers default BaseQueryForm component
   */
  groupings?: React.FunctionComponent<IGroupingProps>;
}

export declare interface ExplorerConfiguration
  extends ExplorerEngineConfiguration {
  /**
   * The name of explorer, used to identify user configuration for the explorer
   * Since it is identifier, it should be a unique
   */
  readonly name: string;

  /**
   * The url basePath the explorer will render relatively
   * @optional
   * @example if the name of explorer is Images Explorer, the basePath will be images-explorer
   * @default value is the lower cased name separated by -
   */
  readonly basePath?: string;

  /**
   * The link to this explorer documentation
   * @default value is https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html
   */
  readonly documentationLink?: string;

  /**  [Fill in empty data illustrations config] **/

  /**
   * Explorer level components
   * like query from, groupings container
   */
  components?: ExplorerUIComponents;

  /**
   * Explorer level additional custom states
   * @optional
   * This property is useful to create custom states for the explorer, and it will be accessible directly from engine
   * The usage of the state defined on state slice documentation
   * @default value is {}
   */
  readonly states?: IEngineStates;
}

export declare interface BaseExplorerPropsNew<
  TEngineInstance extends EngineNew<any, any, SequenceTypesEnum> = EngineNew<
    any,
    any,
    SequenceTypesEnum
  >,
> {
  configuration: ExplorerConfiguration;

  engineInstance: TEngineInstance;

  /**
   * The children component will render static content at the end of explorer
   * @optional
   */
  children?: React.ReactChildren;
}
