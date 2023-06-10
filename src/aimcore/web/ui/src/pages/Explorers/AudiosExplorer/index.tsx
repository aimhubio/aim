import { isDEVModeOn } from 'config/config';

import renderer from 'modules/BaseExplorer';
import AudioBox from 'modules/BaseExplorer/components/AudioBox';

import { SequenceType } from 'types/core/enums';

import { getAudiosDefaultConfig } from './config';

const defaultConfig = getAudiosDefaultConfig();

export const audiosExplorerConfig = {
  name: 'Audios Explorer',
  sequenceType: SequenceType.Audio,
  basePath: 'audios',
  persist: true,
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

const AudiosExplorer = renderer(audiosExplorerConfig, isDEVModeOn);

export default AudiosExplorer;
