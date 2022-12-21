import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import getFiguresExplorerStaticContent from './getStaticContent';
import QueyFormExperimental from './QueyFormExperimental';

const defaultConfig = getDefaultHydration();

const FiguresExperimental = renderer(
  {
    name: 'Figures Explorer',
    sequenceName: SequenceTypesEnum.Figures,
    basePath: 'layout',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    components: {
      queryForm: QueyFormExperimental,
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

export default FiguresExperimental;
