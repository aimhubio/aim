import type { FunctionComponent } from 'react';

import renderer, { getDefaultHydration } from 'modules/BaseExplorer';
import CaptionProperties from 'modules/BaseExplorer/components/Controls/CaptionProperties';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import AudioBoxWrapper from './AudioBoxWrapper';

const defaultConfig = getDefaultHydration();

const AudioExplorer = renderer(
  {
    sequenceName: SequenceTypesEnum.Audios,
    name: 'Audio Explorer',
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer as FunctionComponent,
        controls: {
          captionProperties: {
            component: CaptionProperties,
            state: {
              initialState: {
                displayBoxCaption: true,
                selectedFields: ['run.name', 'figures.name', 'figures.context'],
              },
            },
          },
        },
        box: {
          //@ts-ignore
          component: AudioBoxWrapper,
          hasDepthSlider: true,
          initialState: {
            width: 300,
            height: 150,
            gap: 0,
          },
        },
      },
    },
  },
  __DEV__,
);

export default AudioExplorer;
