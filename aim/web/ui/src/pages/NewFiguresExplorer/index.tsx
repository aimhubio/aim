import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorerNew';
import { QueryForm } from 'modules/BaseExplorerNew/components';
import { Grouping } from 'modules/BaseExplorerNew/components/Grouping/Grouping';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import customStates from './customStates';
import controls from './controls';
import ui from './ui';
import groupings from './groupings';

const FiguresExplorer = renderer({
  sequenceName: SequenceTypesEnum.Figures,
  name: 'Figures Explorer New',
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
});

export default FiguresExplorer;
