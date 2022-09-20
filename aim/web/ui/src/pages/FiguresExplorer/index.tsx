import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import customStates from './customStates';
import controls from './controls';
import ui from './ui';
import groupings from './groupings';

const FiguresExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Figures,
    name: 'Figures Explorer',
    adapter: {
      objectDepth: AimObjectDepths.Step,
    },
    groupings,
    visualizations: {
      vis1: {
        component: getDefaultHydration().Visualizer as FunctionComponent,
        controls: controls,
        box: {
          component: ui.components.box as FunctionComponent,
          initialState: ui.defaultBoxConfig,
        },
      },
    },
    states: customStates,
  },
  true,
);

export default FiguresExplorer;
