import renderer from 'modules/BaseExplorer';
import Audio from 'modules/BaseExplorer/components/Audio';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getAudiosDefaultConfig } from './config';

const defaultConfig = getAudiosDefaultConfig();

const AudiosExplorer = renderer(
  {
    name: 'Audios Explorer',
    sequenceName: SequenceTypesEnum.Audios,
    basePath: 'audios',
    persist: true,
    adapter: {
      objectDepth: AimObjectDepths.Index,
    },
    groupings: defaultConfig.groupings,
    visualizations: {
      vis1: {
        component: defaultConfig.Visualizer,
        controls: defaultConfig.controls,
        box: {
          ...defaultConfig.box,
          component: Audio,
        },
      },
    },
    getStaticContent: defaultConfig.getStaticContent,
  },
  __DEV__,
);

export default AudiosExplorer;
