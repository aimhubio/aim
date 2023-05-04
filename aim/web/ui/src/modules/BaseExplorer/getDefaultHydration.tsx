import * as React from 'react';
import _ from 'lodash-es';

import { ControlsConfigs } from 'modules/core/engine/visualizations/controls';
import {
  GroupingConfigs,
  StyleApplierCallbackArgs,
} from 'modules/core/engine/explorer/groupings';
import { GroupType } from 'modules/core/pipeline';
import Grouping from 'modules/BaseExplorer/components/Grouping';
import { BoxProperties } from 'modules/BaseExplorer/components/Controls';
import FullVewPopover from 'modules/BaseExplorer/components/BoxFullViewPopover';
import Visualizer from 'modules/BaseExplorer/components/Visualizer';
import BoxWrapper from 'modules/BaseExplorer/components/BoxWrapper';
import { AdvancedQueryForm } from 'modules/BaseExplorer/components/QueryForm';
import Controls from 'modules/BaseExplorer/components/Controls';
import getBaseExplorerStaticContent from 'modules/BaseExplorer/utils/getBaseExplorerStaticContent';

import { PersistenceTypesEnum } from '../core/engine/types';

import { IBaseComponentProps } from './types';
import FacetGroupingItem from './components/Grouping/FacetGroupingItem/FacetGroupingItem';

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

/**
 * facet groupings: COLUMN and ROW conflict with GRID grouping and should not be used together, so
 * we need to make sure that only one of them is applied at a time (and GRID isn't applied by default),
 * if you want to change default applications, you can do it in the specific explorer config
 */
const groupings: GroupingConfigs = {
  [GroupType.COLUMN]: {
    component: React.memo((props: IBaseComponentProps) => (
      <FacetGroupingItem
        groupName='columns'
        iconName='group-column'
        {...props}
      />
    )),
    styleApplier: ({ groupInfo, boxConfig }: StyleApplierCallbackArgs<any>) => {
      const rulerWidth =
        groupInfo[GroupType.ROW] && !_.isEmpty(groupInfo[GroupType.ROW].config)
          ? 200
          : 0;
      return {
        left:
          boxConfig.gap +
          (groupInfo[GroupType.COLUMN]
            ? groupInfo[GroupType.COLUMN].order *
              (boxConfig.width + boxConfig.gap)
            : 0) +
          rulerWidth,
      };
    },
    defaultApplications: {
      fields: [],
      orders: [],
      isApplied: true,
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    settings: {
      // settings to pass to component, to use, alter it can be color scales values for color grouping
      facet: true,
    },
  },
  [GroupType.ROW]: {
    component: React.memo((props: IBaseComponentProps) => (
      <FacetGroupingItem groupName='rows' iconName='image-group' {...props} />
    )),
    styleApplier: ({ groupInfo, boxConfig }: StyleApplierCallbackArgs<any>) => {
      const rulerHeight =
        groupInfo[GroupType.COLUMN] &&
        !_.isEmpty(groupInfo[GroupType.COLUMN].config)
          ? 30
          : 0;
      return {
        top:
          boxConfig.gap +
          (groupInfo[GroupType.ROW]
            ? groupInfo[GroupType.ROW].order *
              (boxConfig.height + boxConfig.gap)
            : 0) +
          rulerHeight,
      };
    },
    defaultApplications: {
      fields: [],
      orders: [],
      isApplied: true,
    },
    // state: {
    //   // observable state, to listen on base visualizer
    //   initialState: {
    //     rowLength: 4,
    //   },
    // },
    settings: {
      // settings to pass to component, to use, alter it can be color scales values for color grouping
      facet: true,
    },
  },
  [GroupType.GRID]: {
    component: React.memo((props: IBaseComponentProps) => (
      <FacetGroupingItem groupName='grid' iconName='image-group' {...props} />
    )),
    styleApplier: ({
      groupInfo,
      boxConfig,
      state = {},
    }: StyleApplierCallbackArgs<any>) => {
      if (!groupInfo[GroupType.GRID]) {
        return {};
      }
      const { maxColumnCount = 3 } = state[GroupType.GRID] || {};
      return {
        top:
          boxConfig.gap + groupInfo[GroupType.GRID]
            ? Math.floor(groupInfo[GroupType.GRID].order / maxColumnCount) *
              (boxConfig.height + boxConfig.gap)
            : 0,
        left:
          boxConfig.gap + groupInfo[GroupType.GRID]
            ? (groupInfo[GroupType.GRID].order % maxColumnCount) *
              (boxConfig.width + boxConfig.gap)
            : 0,
      };
    },
    defaultApplications: {
      fields: [],
      orders: [],
      isApplied: false,
    },
    state: {
      initialState: {
        maxColumnCount: 3,
      },
      persist: PersistenceTypesEnum.Url,
    },
    settings: {
      // settings to pass to component, to use, alter it can be color scales values for color grouping
      facet: true,
    },
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
