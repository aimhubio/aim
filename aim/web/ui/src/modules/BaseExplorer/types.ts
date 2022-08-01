import React from 'react';

import { GroupType } from 'modules/BaseExplorerCore/pipeline/grouping/types';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import {
  GroupingConfig,
  GroupingConfigs,
} from '../BaseExplorerCore/core-store/grouping';
import { ControlsConfigs } from '../BaseExplorerCore/core-store/controls';

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
  /**
   * @example
   * {
   *     boxProperties: {
   *       component: BoxProperties,
   *       settings:{
   *           maxWidth: 100
   *           ...etc
   *       },
   *       state: {
   *           initialState: {
   *               test: true
   *           }
   *       }
   *     }
   * }
   *
   * @Usage (if Control component is the default one)
   * function BoxProperties(props: IBaseExplorerProps) {
   *  const state = props.useStore(props.engine.controls.boxProperties.stateSelector);
   *  const settings = props.useStore(props.engine.controls.boxProperties.settings);
   *
   *  // to update state, use props.engine.controls.boxProperties.methods.update
   *  // to reset state, use props.engine.controls.boxProperties.methods.reset
   *  const { component, settings, state } = box_properties;
   *  return <div><div>
   */
  controls?: ControlsConfigs;
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
    visualizations: React.FunctionComponent<IVisualizationProps>[];
    box: React.FunctionComponent<IBoxProps>;
    /*
     * @example
     * function Control(props) {
     *     // props.engine.controls is the encapsulated config generated from engines controls properties
     *     // includes states and methods, settings, and component
     *     const controlItems = Object.keys(props.engine.controls).map(key => {
     *        const controlConfig = props.engine.controls[key];
     *        return <controlConfig.component key={key} {...props} />;
     *     });
     * }
     */
    controls: React.FunctionComponent<IControlsProps>;
  };
};

export interface IQueryFormProps extends IBaseComponentProps {
  hasAdvancedMode?: boolean;
}
export interface IGroupingProps extends IBaseComponentProps {}
export interface IControlsProps extends IBaseComponentProps {}

export interface IVisualizationProps extends IBaseComponentProps {
  box?: React.FunctionComponent<IBoxProps>;
  controlComponent?: React.FunctionComponent<IControlsProps>;
}

export interface IBoxProps extends IBaseComponentProps {
  data: any;
}

export interface IOptionalExplorerConfig {}

export interface IBaseExplorerProps extends IExplorerConfig {
  engineInstance: any;
  explorerName: string;
}

export interface IBaseComponentProps {
  engine: any;
  // dataSelector: () => any;
}
