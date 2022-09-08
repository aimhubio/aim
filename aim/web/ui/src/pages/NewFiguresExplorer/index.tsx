import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorerNew';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import customStates from './customStates';
import controls from './controls';
import ui from './ui';

const FiguresExplorer = renderer({
  sequenceName: SequenceTypesEnum.Figures,
  name: 'Figures Explorer New',
  states: customStates,
  adapter: {
    objectDepth: AimObjectDepths.Step,
  },
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
});

export default FiguresExplorer;
