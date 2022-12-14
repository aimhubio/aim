import produce from 'immer';

import { getDefaultHydration } from 'modules/BaseExplorer';
import { GroupType, Order } from 'modules/core/pipeline';
import { defaultHydration } from 'modules/BaseExplorer/getDefaultHydration';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import getMetricsExplorerStaticContent from './getStaticContent';

export const getMetricsDefaultConfig = (): typeof defaultHydration => {
  const defaultConfig = getDefaultHydration();

  const groupings = produce(defaultConfig.groupings, (draft: any) => {
    draft[GroupType.COLUMN].defaultApplications.orders = [Order.ASC, Order.ASC];
    draft[GroupType.COLUMN].defaultApplications.fields = [
      'run.hash',
      'metric.name',
    ];
    // draft[GroupType.ROW].defaultApplications.orders = [Order.DESC];
    // draft[GroupType.ROW].defaultApplications.fields = ['record.step'];
  });

  const controls = produce(defaultConfig.controls, (draft: any) => {
    draft.captionProperties.state.initialState.selectedFields = [
      'run.name',
      'metric.name',
      'metric.context',
    ];
    draft.axesProperties = {
      component: () => null,
      state: {
        initialState: {
          alignment: {
            metric: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.metric,
            type: CONTROLS_DEFAULT_CONFIG.metrics.alignmentConfig.type,
          },
          axesScale: {
            type: {
              xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.xAxis,
              yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleType.yAxis,
            },
            range: {
              xAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.xAxis,
              yAxis: CONTROLS_DEFAULT_CONFIG.metrics.axesScaleRange.yAxis,
            },
          },
        },
        persist: 'url',
      },
    };
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
      hasDepthSlider: true,
    },
    getStaticContent: getMetricsExplorerStaticContent,
  };
};
