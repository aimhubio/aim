import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import getFiguresExplorerStaticContent from './getStaticContent';

const defaultConfig = getDefaultHydration();

const FiguresExplorer = renderer(
  {
    name: 'Figures Explorer',
    sequenceName: SequenceTypesEnum.Figures,
    basePath: 'figures',
    persist: true,
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
    getStaticContent: getFiguresExplorerStaticContent,
  },
  __DEV__,
);

export default FiguresExplorer;
