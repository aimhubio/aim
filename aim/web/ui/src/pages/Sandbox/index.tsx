import * as React from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import SandboxVisualizer from './SandboxVisualizer';

const defaultConfig = getDefaultHydration();

const FiguresExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Metric,
    name: 'Sandbox',
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    components: {
      queryForm: () => null,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: SandboxVisualizer as React.FunctionComponent,
        controls: {} as any,
        box: {
          component: () => null,
          initialState: {} as any,
        },
      },
    },
    forceRenderVisualizations: true,
    displayProgress: false,
  },
  __DEV__,
);

export default FiguresExplorer;
