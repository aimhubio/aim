import React from 'react';

import { GroupType } from 'modules/core/pipeline';
import { GroupingConfigs } from 'modules/core/engine/explorer/groupings';
import { ControlsConfigs } from 'modules/core/engine/visualizations/controls';
import { CustomStates } from 'modules/core/utils/store';
import { VisualizationsConfig } from 'modules/core/engine/visualizations';
import { EngineNew } from 'modules/core/engine/explorer-engine';
import { PipelineStatusEnum } from 'modules/core/engine/types';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { AimFlatObjectBase } from 'types/core/AimObjects';

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
export interface IControlsProps extends IBaseComponentProps {
  visualizationName: string;
}

export interface IVisualizationsProps extends IBaseComponentProps {
  components: IUIComponents;
  visualizers: VisualizationsConfig;
  getStaticContent?: (
    type: StaticContentType,
    defaultContent?: React.ReactNode,
  ) => React.ReactNode;
}

export interface IVisualizationProps extends IBaseComponentProps {
  box?: React.FunctionComponent<IBoxProps>;
  hasDepthSlider: boolean;
  panelRenderer: () => React.ReactNode;
  name: string;
}

export interface IProgressBarProps extends IBaseComponentProps {}

export interface IBoxProps extends IBaseComponentProps {
  data: any;
  items: AimFlatObjectBase[];
  style?: React.CSSProperties;
  isFullView?: boolean;
  visualizationName: string;
}

export interface IOptionalExplorerConfig {}
export interface IExplorerBarProps extends IBaseComponentProps {
  explorerName: string;
  documentationLink: string;
}
export interface IExplorerNotificationProps extends IBaseComponentProps {}

export interface IBaseComponentProps {
  engine: any;
  // dataSelector: () => any;
}

export declare interface ExplorerEngineConfiguration {
  /**
   * @optional
   * Useful when it need to persist query and grouping states through url
   */
  persist?: boolean; // TODO later use StatePersistOption;
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

  /**
   * Explorer level additional custom states
   * @optional
   * This property is useful to create custom states for the explorer, and it will be accessible directly from engine
   * The usage of the state defined on state slice documentation
   * @default value is {}
   */
  states?: CustomStates;
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
  groupingContainer?: React.FunctionComponent<IGroupingProps>;
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
   * Explorer level static content
   * @param type
   */
  getStaticContent?: (type: string) => React.ReactNode;
}

export declare interface ExplorerProps<
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

export type StaticContentType = string | PipelineStatusEnum;
