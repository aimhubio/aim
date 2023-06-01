import type { FunctionComponent } from 'react';

import renderer from 'modules/BaseExplorer';
import TextBox from 'modules/BaseExplorer/components/TextBox/TextBox';
import { VisualizerLegends } from 'modules/BaseExplorer/components/Widgets';

import { SequenceType } from 'types/core/enums';

import { getTextDefaultConfig } from './config';

const defaultConfig = getTextDefaultConfig();

const PromptsExplorer = renderer(
  {
    name: 'Prompts Explorer',
    sequenceType: SequenceType.Text,
    basePath: 'prompts',
    persist: true,
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer as FunctionComponent,
        controls: defaultConfig.controls,
        box: {
          ...defaultConfig.box,
          component: TextBox,
          initialState: defaultConfig.box.initialState,
        },
        widgets: {
          legends: {
            component: VisualizerLegends,
          },
        },
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default PromptsExplorer;
