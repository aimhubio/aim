import type { FunctionComponent } from 'react';

import renderer from 'modules/BaseExplorer';
import Metrics from 'modules/BaseExplorer/components/Metrics/Metrics';
import { PersistenceTypesEnum } from 'modules/core/engine/types';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getMetricsDefaultConfig } from './config';

const defaultConfig = getMetricsDefaultConfig();

const MetricsExplorer = renderer(
  {
    name: 'Metrics Explorer V2',
    sequenceName: SequenceTypesEnum.Metric,
    basePath: 'metrics_new',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer as FunctionComponent,
        controls: defaultConfig.controls,
        box: {
          component: Metrics,
          hasDepthSlider: defaultConfig.box.hasDepthSlider,
          initialState: defaultConfig.box.initialState,
        },
      },
    },
    states: {
      focusedState: {
        initialState: {
          key: null,
          xValue: null,
          yValue: null,
          active: false,
          chartIndex: null,
          chartId: null,
        },
        persist: PersistenceTypesEnum.Url,
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default MetricsExplorer;