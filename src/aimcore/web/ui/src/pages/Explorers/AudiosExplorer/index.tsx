import renderer from 'modules/BaseExplorer';
import AudioBox from 'modules/BaseExplorer/components/AudioBox';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';

import { getAudiosDefaultConfig } from './config';

const defaultConfig = getAudiosDefaultConfig();

export const audiosExplorerConfig = {
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
        component: AudioBox,
      },
    },
  },
  getStaticContent: defaultConfig.getStaticContent,
};

const AudiosExplorer = renderer(audiosExplorerConfig, __DEV__);

export default AudiosExplorer;
