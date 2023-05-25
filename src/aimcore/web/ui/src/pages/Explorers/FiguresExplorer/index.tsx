import renderer from 'modules/BaseExplorer';
import Figures from 'modules/BaseExplorer/components/Figures';

import { AimObjectDepths, SequenceType } from 'types/core/enums';

import { getFiguresDefaultConfig } from './config';

const defaultConfig = getFiguresDefaultConfig();

export const figuresExplorerConfig = {
  name: 'Figures Explorer',
  sequenceType: SequenceType.Figure,
  basePath: 'figures',
  persist: true,
  adapter: {
    objectDepth: AimObjectDepths.Step,
  },
  groupings: defaultConfig.groupings,
  visualizations: {
    vis1: {
      component: defaultConfig.Visualizer,
      controls: defaultConfig.controls,
      box: {
        ...defaultConfig.box,
        component: Figures,
      },
    },
  },
  getStaticContent: defaultConfig.getStaticContent,
};

const FiguresExplorer = renderer(figuresExplorerConfig, __DEV__);

export default FiguresExplorer;
