import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const defaultConfig = getDefaultHydration();

const FiguresExplorer = renderer(
  {
    persist: true,
    sequenceName: SequenceTypesEnum.Figures,
    name: 'Figures Explorer',
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer as FunctionComponent,
        controls: defaultConfig.controls,
        box: {
          component: Figures,
          hasDepthSlider: defaultConfig.box.hasDepthSlider,
          initialState: defaultConfig.box.initialState,
        },
      },
    },
  },
  true,
);

export default FiguresExplorer;
