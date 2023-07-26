import { isDEVModeOn } from 'config/config';

import renderer from 'modules/BaseExplorer';
import Image from 'modules/BaseExplorer/components/Image';

import { SequenceType } from 'types/core/enums';

import { getImagesDefaultConfig } from './config';

const defaultConfig = getImagesDefaultConfig();

export const imagesExplorerConfig = {
  name: 'Images Explorer',
  sequenceType: SequenceType.Image,
  basePath: 'images',
  persist: true,
  groupings: defaultConfig.groupings,
  visualizations: {
    vis1: {
      component: defaultConfig.Visualizer,
      controls: defaultConfig.controls,
      box: {
        ...defaultConfig.box,
        component: Image,
      },
    },
  },
  getStaticContent: defaultConfig.getStaticContent,
};

const ImagesExplorer = renderer(imagesExplorerConfig, isDEVModeOn);

export default ImagesExplorer;
