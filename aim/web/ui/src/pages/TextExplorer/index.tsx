import type { FunctionComponent } from 'react';

import renderer from 'modules/BaseExplorer';
import TextBox from 'modules/BaseExplorer/components/TextBox/TextBox';
import { VisualizerLegends } from 'modules/BaseExplorer/components/Widgets';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getTextDefaultConfig } from './textConfig';

const defaultConfig = getTextDefaultConfig();

const TextExplorer = renderer(
  {
    name: 'Text Explorer',
    sequenceName: SequenceTypesEnum.Texts,
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
  },
  __DEV__,
);

export default TextExplorer;
