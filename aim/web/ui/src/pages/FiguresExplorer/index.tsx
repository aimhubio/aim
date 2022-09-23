import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures/Figures';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

const defaultConfig = getDefaultHydration();

const FiguresExplorer = renderer(
  {
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
          initialState: defaultConfig.box.initialState,
        },
      },
    },
  },
  __DEV__,
);

export default FiguresExplorer;
