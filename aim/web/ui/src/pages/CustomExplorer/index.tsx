import type { FunctionComponent } from 'react';

import renderer from 'modules/BaseExplorer';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import explorerConfig from './explorerConfig';
import CustomMetricVisualizer from './CustomMetricVisualizer';

const CustomExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Metric,
    name: 'Custom Explorer',
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    groupings: explorerConfig.groupings,
    visualizations: {
      vis1: {
        component: explorerConfig.Visualizer as FunctionComponent,
        controls: explorerConfig.controls,
        box: {
          component: CustomMetricVisualizer,
          initialState: explorerConfig.box.initialState,
          hasDepthSlider: false,
        },
      },
    },
  },
  __DEV__,
);

export default CustomExplorer;
