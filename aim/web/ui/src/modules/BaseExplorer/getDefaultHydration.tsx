import * as React from 'react';
import _ from 'lodash-es';

import { ControlsConfigs } from 'modules/core/engine/visualizations/controls';
import { GroupingConfigs } from 'modules/core/engine/explorer/groupings';
import { GroupType } from 'modules/core/pipeline';
import Grouping, {
  GroupingItem,
} from 'modules/BaseExplorer/components/Grouping';
import { BoxProperties } from 'modules/BaseExplorer/components/Controls';
import FullVewPopover from 'modules/BaseExplorer/components/BoxFullViewPopover';
import Visualizer from 'modules/BaseExplorer/components/Visualizer';
import BoxWrapper from 'modules/BaseExplorer/components/BoxWrapper';
import { AdvancedQueryForm } from 'modules/BaseExplorer/components/QueryForm';
import Controls from 'modules/BaseExplorer/components/Controls';
import getBaseExplorerStaticContent from 'modules/BaseExplorer/utils/getBaseExplorerStaticContent';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { IBaseComponentProps } from './types';

const controls: ControlsConfigs = {
  boxProperties: {
    component: BoxProperties,
    settings: {
      minWidth: 200,
      maxWidth: 800,
      minHeight: 170,
      maxHeight: 800,
      step: 10,
    },
    // no need to have state for boxProperties since it works with the state, which is responsible for grouping as well
    // this is the reason for empty state, the state property is optional, just kept empty here to have an example for other controls
    state: {
      initialState: {},
    },
  },
};

const groupings: GroupingConfigs = {
  [GroupType.COLUMN]: {
    component: React.memo((props: IBaseComponentProps) => (
      <GroupingItem groupName='columns' iconName='group-column' {...props} />
    )),
    // @ts-ignore
    styleApplier: (
      object: AimFlatObjectBase<any>,
      group: any,
      boxConfig: any,
      iteration: number,
    ) => {
      const rulerWidth =
        group[GroupType.ROW] && !_.isEmpty(group[GroupType.ROW].config)
          ? 200
          : 0;
      return {
        left:
          boxConfig.gap +
          (group[GroupType.COLUMN]
            ? group[GroupType.COLUMN].order * (boxConfig.width + boxConfig.gap)
            : 0) +
          rulerWidth,
      };
    },
    defaultApplications: {
      fields: [],
      orders: [],
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    // settings: {
    //   // settings to pass to component, to use, alter it can be color scales values for color grouping
    //   maxRowsLength: 10,
    // },
  },
  [GroupType.ROW]: {
    component: React.memo((props: IBaseComponentProps) => (
      <GroupingItem groupName='rows' iconName='image-group' {...props} />
    )),
    // @ts-ignore
    styleApplier: (
      object: AimFlatObjectBase<any>,
      group: any,
      boxConfig: any,
      iteration: number,
    ) => {
      const rulerHeight =
        group[GroupType.COLUMN] && !_.isEmpty(group[GroupType.COLUMN].config)
          ? 30
          : 0;
      return {
        top:
          boxConfig.gap +
          (group[GroupType.ROW]
            ? group[GroupType.ROW].order * (boxConfig.height + boxConfig.gap)
            : 0) +
          rulerHeight,
      };
    },
    defaultApplications: {
      fields: [],
      orders: [],
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    // settings: {
    //   // settings to pass to component, to use, alter it can be color scales values for color grouping
    //   maxRowsLength: 10,
    // },
  },
};

export const defaultHydration = {
  ObjectFullView: FullVewPopover,
  BoxWrapper: BoxWrapper,
  Visualizer: Visualizer,
  QueryForm: AdvancedQueryForm,
  Controls: Controls,
  Groupings: Grouping,
  documentationLink:
    'https://aimstack.readthedocs.io/en/latest/ui/pages/explorers.html',
  box: {
    persist: true,
    initialState: {
      width: 400,
      height: 400,
      gap: 0,
    },
    stacking: true,
  },
  controls,
  groupings,
  states: {
    depthMap: {
      initialState: {
        sync: true,
      },
    },
  },
  getStaticContent: getBaseExplorerStaticContent,
};

/**
 * getDefaultHydration
 * This file consists of explorer default configuration for ui components and explorer specific options
 * May receive the configuration and return new hydrated object later
 */
function getDefaultHydration(): typeof defaultHydration {
  return defaultHydration;
}

export default getDefaultHydration;
