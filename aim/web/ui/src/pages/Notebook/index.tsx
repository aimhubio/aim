import * as React from 'react';

import renderer from 'modules/BaseExplorer';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import NotebookVisualizer from './NotebookVisualizer';

const Sandbox = renderer(
  {
    sequenceName: SequenceTypesEnum.Metric,
    name: 'Notebook',
    adapter: {
      objectDepth: AimObjectDepths.Sequence,
    },
    components: {
      queryForm: () => null,
    },
    visualizations: {
      vis1: {
        component: NotebookVisualizer as React.FunctionComponent,
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

export default Sandbox;
