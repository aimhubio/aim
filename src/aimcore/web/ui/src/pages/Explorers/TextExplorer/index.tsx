import type { FunctionComponent } from 'react';

import renderer from 'modules/BaseExplorer';
import TextBox from 'modules/BaseExplorer/components/TextBox/TextBox';
import { VisualizerLegends } from 'modules/BaseExplorer/components/Widgets';

import { AimObjectDepths, SequenceType } from 'types/core/enums';

import { getTextDefaultConfig } from './textConfig';

const defaultConfig = getTextDefaultConfig();

export const textExplorerConfig = {
  name: 'Text Explorer',
  sequenceType: SequenceType.Text,
  basePath: 'text',
  persist: true,
  adapter: {
    objectDepth: AimObjectDepths.Index,
  },
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

const TextExplorer = renderer(textExplorerConfig, __DEV__);

export default TextExplorer;
