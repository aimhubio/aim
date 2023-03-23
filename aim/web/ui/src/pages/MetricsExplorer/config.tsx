import * as React from 'react';
import produce from 'immer';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { GroupingItem } from 'modules/BaseExplorer/components/Grouping';
import { PersistenceTypesEnum } from 'modules/core/engine/types';
import Aggregation from 'modules/BaseExplorer/components/Controls/Aggregation';
import ConfigureAxes from 'modules/BaseExplorer/components/Controls/ConfigureAxes';
import Smoothing from 'modules/BaseExplorer/components/Controls/Smoothing';
import IgnoreOutliers from 'modules/BaseExplorer/components/Controls/IgnoreOutliers';
import Highlighting from 'modules/BaseExplorer/components/Controls/Highlighting';
import Zoom from 'modules/BaseExplorer/components/Controls/Zoom';
import ConfigureTooltip from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';
import Legends from 'modules/BaseExplorer/components/Controls/Legends';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import getMetricsExplorerStaticContent from './getStaticContent';

export const getMetricsDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();

  const groupings = produce(defaultConfig.groupings, (draft: any) => {
    draft[GroupType.COLUMN].defaultApplications.orders = [Order.ASC];
    draft[GroupType.COLUMN].defaultApplications.fields = ['metric.name'];

    draft[GroupType.ROW].defaultApplications.orders = [Order.ASC];
    draft[GroupType.ROW].defaultApplications.fields = ['metric.context.subset'];

    draft[GroupType.COLOR] = {
      component: React.memo((props: IBaseComponentProps) => (
        <GroupingItem groupName='color' iconName='group-column' {...props} />
      )),
      // @ts-ignore
      styleApplier: (object: AimFlatObjectBase<any>, group: any) => {
        const palletIndex = 0;
        const pallet = COLORS[palletIndex];
        const order = group[GroupType.COLOR]?.order || 0;
        return {
          color: pallet[order % pallet.length],
        };
      },
      defaultApplications: {
        fields: ['run.hash'],
        orders: [Order.ASC],
      },
      // @TODO add support for selecting color pallet by 'palletIndex'
      // state: {
      //   initialState: {
      //     palletIndex: 0,
      //   },
      // },
      // settings: {
      //   pallets: COLORS,
      // },
    };
    draft[GroupType.STROKE] = {
      component: React.memo((props: IBaseComponentProps) => (
        <GroupingItem groupName='stroke' iconName='group-column' {...props} />
      )),
      // @ts-ignore
      styleApplier: (object: AimFlatObjectBase<any>, group: any) => {
        const order = group[GroupType.STROKE]?.order || 0;
        return {
          dasharray: DASH_ARRAYS[order % DASH_ARRAYS.length],
        };
      },
      defaultApplications: {
        fields: [],
        orders: [],
      },
    };
  });

  const controls = produce(defaultConfig.controls, (draft: any) => {
    draft.aggregation = {
      component: Aggregation,
      state: {
        initialState: {
          methods: CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig.methods,
          isApplied:
            CONTROLS_DEFAULT_CONFIG.metrics.aggregationConfig.isApplied,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.axesProperties = {
      component: ConfigureAxes,
      state: {
        initialState: {
          alignment: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig,
          axesScaleType: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType,
          axesScaleRange: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.ignoreOutliers = {
      component: IgnoreOutliers,
      state: {
        initialState: {
          isApplied: CONTROLS_DEFAULT_CONFIG.metrics.ignoreOutliers,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.smoothing = {
      component: Smoothing,
      state: {
        initialState: {
          algorithm: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.algorithm,
          factor: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.factor,
          curveInterpolation:
            CONTROLS_DEFAULT_CONFIG.metrics.smoothing.curveInterpolation,
          isApplied: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.isApplied,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.highlighting = {
      component: Highlighting,
      state: {
        initialState: {
          mode: CONTROLS_DEFAULT_CONFIG.metrics.highlightMode,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.tooltip = {
      component: ConfigureTooltip,
      state: {
        initialState: {
          appearance: CONTROLS_DEFAULT_CONFIG.metrics.tooltip.appearance,
          display: CONTROLS_DEFAULT_CONFIG.metrics.tooltip.display,
          selectedFields:
            CONTROLS_DEFAULT_CONFIG.metrics.tooltip.selectedFields,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.legends = {
      component: Legends,
      state: {
        initialState: {
          display: CONTROLS_DEFAULT_CONFIG.metrics.legends.display,
          mode: CONTROLS_DEFAULT_CONFIG.metrics.legends.mode,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    draft.zoom = {
      component: Zoom,
      state: {
        initialState: {
          active: CONTROLS_DEFAULT_CONFIG.metrics.zoom.active,
          mode: CONTROLS_DEFAULT_CONFIG.metrics.zoom.mode,
          history: CONTROLS_DEFAULT_CONFIG.metrics.zoom.history,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
  });

  const box = produce(defaultConfig.box, (draft: any) => {
    draft.stacking = false;
  });

  return {
    ...defaultConfig,
    groupings,
    controls,
    box,
    getStaticContent: getMetricsExplorerStaticContent,
  };
};
