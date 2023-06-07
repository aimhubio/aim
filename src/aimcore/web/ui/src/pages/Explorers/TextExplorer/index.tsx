import type { FunctionComponent } from 'react';

import { isDEVModeOn } from 'config/config';

import renderer from 'modules/BaseExplorer';
import TextBox from 'modules/BaseExplorer/components/TextBox/TextBox';
import { VisualizerLegends } from 'modules/BaseExplorer/components/Widgets';

import { SequenceType } from 'types/core/enums';

import { getTextDefaultConfig } from './config';

const defaultConfig = getTextDefaultConfig();

export const textExplorerConfig = {
  name: 'Text Explorer',
  sequenceType: SequenceType.Text,
  basePath: 'text',
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
};

const TextExplorer = renderer(textExplorerConfig, isDEVModeOn);

export default TextExplorer;
