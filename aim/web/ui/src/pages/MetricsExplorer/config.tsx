import * as React from 'react';
import produce from 'immer';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';
import { IBaseComponentProps } from 'modules/BaseExplorer/types';
import { GroupingItem } from 'modules/BaseExplorer/components/Grouping';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from '../../utils/aggregateGroupData';
import { PersistenceTypesEnum } from '../../modules/core/engine/types';

import getMetricsExplorerStaticContent from './getStaticContent';
import Aggregation from './Controls/Aggregation/Aggregation';

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
        fields: [Order.ASC],
        orders: ['run.hash'],
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
          methods: {
            area: AggregationAreaMethods.MIN_MAX,
            line: AggregationLineMethods.MEAN,
          },
          isApplied: false,
        },
        persist: PersistenceTypesEnum.Url,
      },
    };
    // draft.axesProperties = {
    //   component: () => null,
    //   state: {
    //     initialState: {
    //       alignment: {
    //         metric: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.metric,
    //         type: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.type,
    //       },
    //       axesScale: {
    //         type: {
    //           xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.xAxis,
    //           yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.yAxis,
    //         },
    //         range: {
    //           xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.xAxis,
    //           yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.yAxis,
    //         },
    //       },
    //     },
    //     persist: 'url',
    //   },
    // };
  });

  return {
    ...defaultConfig,
    groupings,
    controls,
    box: {
      ...defaultConfig.box,
      initialState: {
        width: 400,
        height: 400,
        gap: 0,
      },
      hasDepthSlider: false,
    },
    getStaticContent: getMetricsExplorerStaticContent,
  };
};
